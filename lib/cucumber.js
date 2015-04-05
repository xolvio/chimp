var path       = require('path'),
    cucumberjs = require('cucumber');

/**
 * Cucumber Constructor
 *
 * @param {Object} options
 * @api public
 */

function Cucumber (options) {
  this.options = options;
}

/**
 * Run Cucumber specs
 *
 * @param {Function} callback
 * @api public
 */

Cucumber.prototype.run = function (callback) {

  var execOptions = _getExecOptions(this.options);
  var configuration = cucumberjs.Cli.Configuration(execOptions),
      runtime = cucumberjs.Runtime(configuration);

  var formatter = new cucumberjs.Listener.JsonFormatter();
  formatter.log = function (results) {
    // if we have an IPC channel, use it to send JSON to the parent process
    if (process.send) {
      process.send(results);
    }
  };

  runtime.attachListener(formatter);
  runtime.attachListener(configuration.getFormatter());
  runtime.start(function (pass) {
    callback(pass ? null : true);
  });

};

function _getExecOptions (options) {
  var execOptions = ['node', path.resolve(__dirname, path.join('..', 'node_modules', '.bin', 'cucumber.js'))];

  var features = options._.splice(2).toString();
  execOptions.push(features);
  execOptions.push('-r');
  execOptions.push(path.join(options.path, 'step_definitions'));
  execOptions.push('-r');
  execOptions.push(path.resolve(__dirname, 'cucumberjs', path.join('world.js')));
  execOptions.push('-r');
  execOptions.push(path.resolve(__dirname, 'cucumberjs', path.join('hooks.js')));

  var allowedCucumberJsOptions = {
    long: ['require', 'format', 'progress', 'tags', 'help', 'strict', 'version', 'coffee', 'snippets'],
    short: ['r', 'f', 't', 'h', 'S', 'i']
  };

  for (var option in options) {
    if (allowedCucumberJsOptions.long.indexOf(option) !== -1) {
      execOptions.push('--' + option);
      execOptions.push(options[option].toString());
    }
    if (allowedCucumberJsOptions.short.indexOf(option) !== -1) {
      execOptions.push('-' + option);
      execOptions.push(options[option].toString());
    }
  }

  return execOptions;
}

module.exports = Cucumber;
