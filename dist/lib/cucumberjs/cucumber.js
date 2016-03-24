'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path');
var cp = require('child-process-debug');
var processHelper = require('./../process-helper.js');
var log = require('./../log');
var _ = require('underscore');
var booleanHelper = require('../boolean-helper');
var fs = require('fs-extra');

/**
 * Run Cucumber specs
 *
 * @param {Function} callback
 * @api public
 */

var Cucumber = function () {
  function Cucumber(options) {
    (0, _classCallCheck3.default)(this, Cucumber);

    this.options = options;
    this.cucumberChild = null;
  }

  (0, _createClass3.default)(Cucumber, [{
    key: 'start',
    value: function start(callback) {
      var _this = this;

      var args = this._getExecOptions(this.options);

      if (!fs.existsSync(this.options.path)) {
        log.info('[chimp][cucumber] Directory', this.options.path, 'does not exist. Not running');
        callback();
        return;
      }

      log.debug('[chimp][cucumber] Running with', args);

      var opts = {
        env: process.env,
        silent: true
      };

      var port = void 0;
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
      process.stdin.pipe(this.cucumberChild.stdin);

      this.cucumberChild.stdout.on('data', function (data) {
        _this._conditionMessage(data.toString());
      });

      this.cucumberChild.stderr.pipe(process.stderr);

      var jsonResults = null;
      this.cucumberChild.on('message', function (res) {
        log.debug('[chimp][cucumber] Received message from cucumber child. Result:', res);
        jsonResults = res;
      });

      this.cucumberChild.on('close', function (code) {
        log.debug('[chimp][cucumber] Closed with code', code);

        if (!_this.cucumberChild.stopping) {
          log.debug('[chimp][cucumber] Cucumber not in a stopping state');

          var result = jsonResults;
          if (_this.options.jsonOutput) {
            var dir = path.dirname(_this.options.jsonOutput);
            log.debug('[chimp][cucumber] Ensuring directory exists', dir);
            fs.mkdirsSync(dir);
            log.debug('[chimp][cucumber] Writing json results to', _this.options.jsonOutput);
            fs.writeFileSync(_this.options.jsonOutput, jsonResults);
            log.debug('[chimp][cucumber] Finished writing results');
          }

          callback(code !== 0 ? 'Cucumber steps failed' : null, result);
        }
      });
    }
  }, {
    key: 'interrupt',
    value: function interrupt(callback) {
      var _this2 = this;

      log.debug('[chimp][cucumber] interrupting cucumber');

      if (!this.cucumberChild) {
        log.debug('[chimp][cucumber] no child to interrupt');
        return callback();
      }
      this.cucumberChild.stopping = true;

      var options = {
        child: this.cucumberChild,
        prefix: 'cucumber'
      };

      processHelper.kill(options, function (err, res) {
        _this2.cucumberChild = null;
        if (callback) {
          callback(err, res);
        }
      });
    }
  }, {
    key: '_getRecommendedFilename',
    value: function _getRecommendedFilename(line) {
      var stepType = line.match(/this\.(Given|When|Then)/)[1];
      var recommendedFilename = stepType + ' ' + line.match(/\^(.*)\$/)[1];
      recommendedFilename = recommendedFilename.replace(/".*"/g, '#');
      recommendedFilename = recommendedFilename.replace(/\(.*\)/g, '#');
      recommendedFilename = recommendedFilename.replace(/\\/g, '');
      recommendedFilename = recommendedFilename.replace(/\$/g, '');
      recommendedFilename = recommendedFilename.replace(/ /g, this.options.recommendedFilenameSeparator || ' ');
      return recommendedFilename;
    }
  }, {
    key: '_conditionOutput',
    value: function _conditionOutput(message) {
      var _this3 = this;

      if (message.indexOf('callback.pending()') === -1) {
        process.stdout.write(message);
        return;
      }

      try {
        (function () {
          var defaultText = 'Write code here that turns the phrase above into concrete actions';
          var replacementText = 'Write the automation code here';
          var tab = '';
          var self = _this3;
          _.each(message.split('\n'), function (eachLine) {
            if (booleanHelper.isTruthy(self.options.singleSnippetPerFile) && eachLine.match(/this\./)) {
              process.stdout.write('// Recommended filename: '.gray + (self._getRecommendedFilename(eachLine) + '.js\n').cyan);
              process.stdout.write('module.exports = function() {\n'.yellow);
              tab = '  ';
            }
            var line = eachLine;
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
        })();
      } catch (e) {
        log.debug('[chimp][cucumber] Error conditioning message', e);
        process.stdout.write(message);
      }
    }
  }, {
    key: '_conditionMessage',
    value: function _conditionMessage(message) {
      if (this.options.debug) {
        log.debug(message);
        return;
      }

      // output any strings that don't contain a stack trace
      if (message.indexOf('  at') === -1) {
        this._conditionOutput(message);
        return;
      }

      var msg = '';
      var basePath = path.resolve('.', this.options.path);
      var basePathParent = path.resolve(basePath, '..');
      var TAB = '    ';

      try {
        _.each(message.split('\n'), function (line) {
          var trimmedLine = line.trim();
          var relativePathLine = line.replace(basePathParent + path.sep, '');

          // filter out some known unnecessary lines
          // console.error('[' + line + ']');
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
    }
  }, {
    key: '_getExecOptions',
    value: function _getExecOptions(options) {
      var execOptions = ['node', path.resolve(__dirname, path.join('..', '..', '..', 'node_modules', '.bin', 'cucumber.js'))];

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

      // See: https://github.com/cucumber/cucumber-js/blob/v0.9.2/lib/cucumber/cli.js
      var allowedCucumberJsOptions = {
        long: ['version', 'backtrace', 'compiler', 'dry-run', 'fail-fast', 'format', 'no-colors', 'no-snippets', 'no-source', 'profile', 'require', 'snippet-syntax', 'strict', 'tags', 'help'],
        short: ['v', 'b', 'd', 'f', 'p', 'r', 'S', 't']
      };

      _.forEach(options, function (eachOptionValues, optionName) {
        var optionValues = _.isArray(eachOptionValues) ? eachOptionValues : [eachOptionValues];

        if (_.contains(allowedCucumberJsOptions.long, optionName)) {
          _.forEach(optionValues, function (optionValue) {
            execOptions.push('--' + optionName);
            if (optionName !== 'strict') {
              execOptions.push(optionValue.toString());
            }
          });
        } else if (_.contains(allowedCucumberJsOptions.short, optionName)) {
          _.forEach(optionValues, function (optionValue) {
            execOptions.push('-' + optionName);
            if (optionName !== 'S') {
              execOptions.push(optionValue.toString());
            }
          });
        } else if (_.last(optionValues) === false && _.contains(allowedCucumberJsOptions.long, 'no-' + optionName)) {
          execOptions.push('--no-' + optionName);
        }
      });

      log.debug('[chimp][cucumber] Cucumber exec options are: ', execOptions);
      return execOptions;
    }
  }]);
  return Cucumber;
}();

module.exports = Cucumber;