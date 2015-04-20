var path           = require('path'),
    cp             = require('child_process'),
    _cucumberChild = null;

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

  _cucumberChild = cp.fork(path.join(__dirname, 'cucumber-wrapper.js'), execOptions, {
    env: process.env
  });

  _cucumberChild.on('close', function (code) {
    if (!_cucumberChild.interrupted) {
      callback(code !== 0);
    }
  });

  // TODO make an IPC pass-through for meteor-cucumber

};

Cucumber.prototype.interrupt = function (callback) {

  if (!_cucumberChild) {
    return;
  }

  _cucumberChild.interrupted = true;
  _cucumberChild.kill('SIGINT');

  if (callback) {
    var waitForProcessToDie = setInterval(function () {
      try {
        process.kill(_cucumberChild.pid, 0);
      } catch (e) {
        _cucumberChild = null;
        clearInterval(waitForProcessToDie);
        callback();
      }
    }, 100);
  }
};

function _getExecOptions (options) {
  var execOptions = ['node', path.resolve(__dirname, path.join('..', 'node_modules', '.bin', 'cucumber.js'))];

  var features = options._.splice(2).toString();

  if (features) {
    execOptions.push(features);
  }

  execOptions.push('-r');
  execOptions.push(options.path);
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
