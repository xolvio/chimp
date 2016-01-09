var path          = require('path'),
    cp            = require('child-process-debug'),
    processHelper = require('./../process-helper.js'),
    log           = require('./../log'),
    _             = require('underscore'),
    colors        = require('colors'),
    fs            = require('fs-extra');

/**
 * Cucumber Constructor
 *
 * @param {Object} options
 * @api public
 */

function Cucumber (options) {
  this.options = options;
  this.cucumberChild = null;
}

/**
 * Run Cucumber specs
 *
 * @param {Function} callback
 * @api public
 */

Cucumber.prototype.start = function (callback) {

  var self = this,
      args = _getExecOptions(self.options);

  if (!fs.existsSync(self.options.path)) {
    log.info('[chimp][cucumber] Directory', self.options.path, 'does not exist. Not running');
    callback();
    return;
  }

  log.debug('[chimp][cucumber] Running with', args);

  var opts = {
    env: process.env,
    silent: true
  };

  var port;
  if (this.options.debugCucumber) {
    port = parseInt(this.options.debugCucumber);
    if (port > 1) {
      opts.execArgv = ['--debug=' + port];
    } else {
      opts.execArgv = ['--debug'];
    }
  }

  if (this.options.debugBrkCucumber) {
    port = parseInt(this.options.debugBrkCucumber);
    if (port > 1) {
      opts.execArgv = ['--debug-brk=' + port];
    } else {
      opts.execArgv = ['--debug-brk'];
    }
  }

  self.cucumberChild = cp.fork(path.join(__dirname, 'cucumber-wrapper.js'), args, opts);
  process.stdin.pipe(self.cucumberChild.stdin);

  self.cucumberChild.stdout.on('data', function (data) {
    self._conditionMessage(data.toString());
  });

  self.cucumberChild.stderr.pipe(process.stderr);

  var jsonResults = null;
  self.cucumberChild.on('message', function (res) {
    log.debug('[chimp][cucumber] Received message from cucumber child. Result:', res);
    jsonResults = res;
  });

  self.cucumberChild.on('close', function (code) {
    log.debug('[chimp][cucumber] Closed with code', code);

    if (!self.cucumberChild.stopping) {

      log.debug('[chimp][cucumber] Cucumber not in a stopping state');

      var result = jsonResults;
      if (self.options.jsonOutput) {
        var dir = path.dirname(self.options.jsonOutput);
        log.debug('[chimp][cucumber] Ensuring directory exists', dir);
        fs.mkdirsSync(dir);
        log.debug('[chimp][cucumber] Writing json results to', self.options.jsonOutput);
        fs.writeFileSync(self.options.jsonOutput, jsonResults);
        log.debug('[chimp][cucumber] Finished writing results');
      }

      callback(code !== 0 ? 'Cucumber steps failed' : null, result);
    }
  });

};

Cucumber.prototype.interrupt = function (callback) {

  log.debug('[chimp][cucumber] interrupting cucumber');

  var self = this;

  if (!self.cucumberChild) {
    log.debug('[chimp][cucumber] no child to interrupt');
    return callback();
  }
  self.cucumberChild.stopping = true;

  var options = {
    child: self.cucumberChild,
    prefix: 'cucumber'
  };

  processHelper.kill(options, function (err, res) {
    self.cucumberChild = null;
    if (callback) {
      callback(err, res);
    }
  });

};

Cucumber.prototype._getRecommendedFilename = function(line) {
  var stepType = line.match(/this\.(Given|When|Then)/)[1];
  var recommendedFilename = stepType + ' ' + line.match(/\^(.*)\$/)[1];
  recommendedFilename = recommendedFilename.replace(/".*"/g, '#');
  recommendedFilename = recommendedFilename.replace(/\(.*\)/g, '#');
  recommendedFilename = recommendedFilename.replace(/\\/g, '');
  recommendedFilename = recommendedFilename.replace(/\$/g, '');
  recommendedFilename = recommendedFilename.replace(/ /g, this.options.recommendedFilenameSeparator || ' ');
  return recommendedFilename;
};

Cucumber.prototype._conditionOutput = function (message) {

  if (message.indexOf('callback.pending()') === -1) {
    process.stdout.write(message);
    return;
  }

  var defaultText = 'Write code here that turns the phrase above into concrete actions';
  var replacementText = 'Write the automation code here';

  try {
    var tab = '';
    var self = this;
    _.each(message.split('\n'), function (line) {
      if (self.options.singleSnippetPerFile && line.match(/this\./)) {
        process.stdout.write('// Recommended filename: '.gray + (self._getRecommendedFilename(line) + '.js\n').cyan);
        process.stdout.write('module.exports = function() {\n'.yellow);
        tab = '  ';
      }
      line = line.replace(defaultText, replacementText);
      line = line.replace('callback.pending()', 'pending()');
      line = line.replace(', callback', '');
      line = line.replace('callback', '');
      process.stdout.write(tab + line + '\n');
      if (self.options.singleSnippetPerFile && line.match(/}\);/)) {
        process.stdout.write('};\n'.yellow);
        tab = '';
      }
    });
  } catch (e) {
    log.debug('[chimp][cucumber] Error conditioning message', e);
    process.stdout.write(message);
  }


};

Cucumber.prototype._conditionMessage = function (message) {

  if (this.options.debug) {
    log.debug(message);
    return;
  }

  // output any strings that don't contain a stack trace
  if (message.indexOf('  at') === -1) {
    this._conditionOutput(message);
    return;
  }

  var msg            = '',
      basePath       = path.resolve('.', this.options.path),
      basePathParent = path.resolve(basePath, '..'),
      TAB            = '    ';

  try {

    _.each(message.split('\n'), function (line) {

      var trimmedLine      = line.trim(),
          relativePathLine = line.replace(basePathParent + path.sep, '');

      // filter out some known unnecessary lines
      //console.error('[' + line + ']');
      if (trimmedLine.indexOf('node.js:') !== -1) {
        return;
      }

      // for stack trace lines
      if (trimmedLine.indexOf('at') === 0) {
        // that contain a path to a source file in the features directory
        if (trimmedLine.indexOf(basePath) !== -1) {
          msg += relativePathLine.yellow + '\n';
        }
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

};

function _getExecOptions (options) {
  var execOptions = ['node', path.resolve(__dirname, path.join('..', 'node_modules', '.bin', 'cucumber.js'))];

  // XXX a feature may be defined at the start or end
  // XXX do other options also get passed with this command?
  var features = options._.splice(2).toString() || options.features || options.path;
  if (features.indexOf(',') !== -1) {
    features = features.split(',');
    _.each(features, function (feature) {
      execOptions.push(feature);
    });
  } else {
    execOptions.push(features);
  }

  execOptions.push('-r');
  execOptions.push(path.resolve(__dirname, path.join('../chimp-helper.js')));
  execOptions.push('-r');
  execOptions.push(path.resolve(__dirname, path.join('world.js')));
  execOptions.push('-r');
  execOptions.push(path.resolve(__dirname, path.join('hooks.js')));

  if (!options.r && !options.require) {
    execOptions.push('-r');
    execOptions.push(options.path);
  }

  var allowedCucumberJsOptions = {
    long: ['require', 'format', 'progress', 'tags', 'help', 'strict', 'coffee', 'snippets'],
    short: ['r', 'f', 't', 'h', 'S', 'i']
  };

  _.forEach(options, function (optionValues, optionName) {
    optionValues = _.isArray(optionValues) ? optionValues : [optionValues];

    if (_.contains(allowedCucumberJsOptions.long, optionName)) {
      _.forEach(optionValues, function (optionValue) {
        execOptions.push('--' + optionName);
        execOptions.push(optionValue.toString());
      })
    } else if (_.contains(allowedCucumberJsOptions.short, optionName)) {
      _.forEach(optionValues, function (optionValue) {
        execOptions.push('-' + optionName);
        execOptions.push(optionValue.toString());
      })
    }
  });

  return execOptions;
}

module.exports = Cucumber;
