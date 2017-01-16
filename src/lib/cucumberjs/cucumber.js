const path = require('path');
const cp = require('child-process-debug');
const processHelper = require('./../process-helper.js');
const log = require('./../log');
const _ = require('underscore');
const booleanHelper = require('../boolean-helper');
const fs = require('fs-extra');

/**
 * Run Cucumber specs
 *
 * @param {Function} callback
 * @api public
 */

class Cucumber {
  constructor(options) {
    this.options = options;
    this.cucumberChild = null;
  }

  start(callback) {
    const args = this._getExecOptions(this.options);

    if (!fs.existsSync(this.options.path)) {
      log.info('[chimp][cucumber] Directory', this.options.path, 'does not exist. Not running');
      callback();
      return;
    }

    log.debug('[chimp][cucumber] Running with', args);

    const opts = {
      env: process.env,
      silent: true,
    };

    let port;
    if (booleanHelper.isTruthy(this.options.debugCucumber)) {
      port = parseInt(this.options.debugCucumber, 10);
      if (port > 1) {
        opts.execArgv = ['--debug=' + port];
      } else {
        opts.execArgv = ['--debug'];
      }
    }

    if (booleanHelper.isTruthy(this.options.debugBrkCucumber)) {
      port = parseInt(this.options.debugBrkCucumber, 10);
      if (port > 1) {
        opts.execArgv = ['--debug-brk=' + port];
      } else {
        opts.execArgv = ['--debug-brk'];
      }
    }

    this.cucumberChild = cp.fork(path.join(__dirname, 'cucumber-wrapper.js'), args, opts);

    if (booleanHelper.isTruthy(this.options.conditionOutput)) {
      this.cucumberChild.stdout.on('data', (data) => {
        this._conditionMessage(data.toString());
      });
    } else {
      this.cucumberChild.stdout.pipe(process.stdout);
    }

    this.cucumberChild.stderr.pipe(process.stderr);

    let jsonResults = null;
    this.cucumberChild.on('message', (res) => {
      log.debug('[chimp][cucumber] Received message from cucumber child. Result:', res);
      jsonResults = res;
    });

    this.cucumberChild.on('close', (code) => {
      log.debug('[chimp][cucumber] Closed with code', code);

      if (!this.cucumberChild.stopping) {
        log.debug('[chimp][cucumber] Cucumber not in a stopping state');

        const result = jsonResults;
        if (this.options.jsonOutput && JSON.parse(jsonResults).length) {
          const dir = path.dirname(this.options.jsonOutput);
          log.debug('[chimp][cucumber] Ensuring directory exists', dir);
          fs.mkdirsSync(dir);
          log.debug('[chimp][cucumber] Writing json results to', this.options.jsonOutput);
          fs.writeFileSync(this.options.jsonOutput, jsonResults);
          log.debug('[chimp][cucumber] Finished writing results');
        }

        callback(code !== 0 ? 'Cucumber steps failed' : null, result);
      }
    });
  }

  interrupt(callback) {
    log.debug('[chimp][cucumber] interrupting cucumber');

    if (!this.cucumberChild) {
      log.debug('[chimp][cucumber] no child to interrupt');
      return callback();
    }
    this.cucumberChild.stopping = true;

    const options = {
      child: this.cucumberChild,
      prefix: 'cucumber',
    };

    processHelper.kill(options, (err, res) => {
      this.cucumberChild = null;
      if (callback) {
        callback(err, res);
      }
    });
  }

  _getRecommendedFilename(line) {
    const stepType = line.match(/this\.(Given|When|Then)/)[1];
    let recommendedFilename = stepType + ' ' + line.match(/\^(.*)\$/)[1];
    recommendedFilename = recommendedFilename.replace(/".*"/g, '#');
    recommendedFilename = recommendedFilename.replace(/\(.*\)/g, '#');
    recommendedFilename = recommendedFilename.replace(/\\/g, '');
    recommendedFilename = recommendedFilename.replace(/\$/g, '');
    recommendedFilename = recommendedFilename.replace(/ /g, this.options.recommendedFilenameSeparator || ' ');
    return recommendedFilename;
  }

  _conditionOutput(message) {
    if (message.indexOf('callback.pending()') === -1) {
      process.stdout.write(message);
      return;
    }

    try {
      const defaultText = 'Write code here that turns the phrase above into concrete actions';
      const replacementText = 'Write the automation code here';
      let tab = '';
      const self = this;
      _.each(message.split('\n'), (eachLine) => {
        if (booleanHelper.isTruthy(self.options.singleSnippetPerFile) && eachLine.match(/this\./)) {
          process.stdout.write('// Recommended filename: '.gray + (self._getRecommendedFilename(eachLine) + '.js\n').cyan);
          process.stdout.write('module.exports = function() {\n'.yellow);
          tab = '  ';
        }
        let line = eachLine;
        line = line.replace(defaultText, replacementText);
        line = line.replace('callback.pending()', 'pending()');
        line = line.replace(', callback', '');
        line = line.replace('callback', '');
        process.stdout.write(tab + line + '\n');
        if (booleanHelper.isTruthy(self.options.singleSnippetPerFile) && line.match(/}\);/)) {
          process.stdout.write('};\n'.yellow);
          tab = '';
        }
      });
    } catch (e) {
      log.debug('[chimp][cucumber] Error conditioning message', e);
      process.stdout.write(message);
    }
  }

  _conditionMessage(message) {
    if (this.options.debug) {
      log.debug(message);
      return;
    }

    // output any strings that don't contain a stack trace
    if (message.indexOf('  at') === -1) {
      this._conditionOutput(message);
      return;
    }

    let msg = '';
    const basePath = path.resolve('.', this.options.path);
    const basePathParent = path.resolve(basePath, '..');
    const TAB = '    ';

    try {
      _.each(message.split('\n'), (line) => {
        const trimmedLine = line.trim();
        const relativePathLine = line.replace(basePathParent + path.sep, '');
        // filter out some known unnecessary lines
        // console.error('[' + line + ']');
        if (trimmedLine.indexOf('node_modules') !== -1) {
          return;
        }
        // for stack trace lines
        if (trimmedLine.indexOf('at') === 0) {
          msg += relativePathLine.yellow + '\n';
        } else {
          // or other lines that start with a tab (cucumber repeats errors at the end)
          if (line.indexOf(TAB) !== -1) {
            msg += relativePathLine.yellow + '\n';
          } else {
            msg += relativePathLine.magenta + '\n';
          }
        }
      });

      process.stdout.write(msg);
    } catch (e) {
      log.debug('[chimp][cucumber] Error conditioning console out', e);
      process.stdout.write(message);
    }
  }

  _getExecOptions(options) {
    const execOptions = ['node', path.resolve(__dirname,
      path.join('..', '..', '..', 'node_modules', '.bin', 'cucumber.js')
    )];

    // XXX a feature may be defined at the start or end
    // XXX do other options also get passed with this command?
    let features = options._.splice(2).toString() || options.features || options.path;
    if (features.indexOf(',') !== -1) {
      features = features.split(',');
      _.each(features, (feature) => {
        execOptions.push(feature);
      });
    } else {
      execOptions.push(features);
    }

    execOptions.push('-r');
    execOptions.push(path.resolve(__dirname, path.join('../chimp-helper.js')));
    execOptions.push('-r');
    execOptions.push(path.resolve(__dirname, path.join('world.js')));
    if (!options.domainOnly) {
      execOptions.push('-r');
      execOptions.push(path.resolve(__dirname, path.join('hooks.js')));
    }

    if (!options.r && !options.require) {
      execOptions.push('-r');
      execOptions.push(options.path);
    }

    // See: https://github.com/cucumber/cucumber-js/blob/v0.9.2/lib/cucumber/cli.js
    const allowedCucumberJsOptions = {
      long: [
        'version', 'backtrace', 'compiler', 'dry-run', 'fail-fast', 'format',
        'no-colors', 'no-snippets', 'no-source', 'profile', 'require', 'snippet-syntax',
        'strict', 'tags', 'help',
      ],
      short: ['v', 'b', 'd', 'f', 'p', 'r', 'S', 't'],
    };

    _.forEach(options, (eachOptionValues, optionName) => {
      const optionValues = _.isArray(eachOptionValues) ? eachOptionValues : [eachOptionValues];

      if (_.contains(allowedCucumberJsOptions.long, optionName)) {
        _.forEach(optionValues, (optionValue) => {
          execOptions.push('--' + optionName);
          if (['dry-run', 'fail-fast', 'no-colors', 'no-snippets', 'no-source', 'strict', 'backtrace'].indexOf(optionName) === -1) {
            execOptions.push(optionValue.toString());
          }
        });
      } else if (_.contains(allowedCucumberJsOptions.short, optionName)) {
        _.forEach(optionValues, (optionValue) => {
          execOptions.push('-' + optionName);
          if (['d', 'S', 'b'].indexOf(optionName) === -1) {
            execOptions.push(optionValue.toString());
          }
        });
      } else if (_.last(optionValues) === false &&
        _.contains(allowedCucumberJsOptions.long, 'no-' + optionName)
      ) {
        execOptions.push('--no-' + optionName);
      }
    });

    log.debug('[chimp][cucumber] Cucumber exec options are: ', execOptions);
    return execOptions;
  }

}
module.exports = Cucumber;
