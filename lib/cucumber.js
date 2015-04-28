var path = require('path'),
    cp   = require('child_process'),
    log  = require('loglevel');

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
      execOptions = _getExecOptions(self.options);

  log.debug('[cucumber] Running');

  self.cucumberChild = cp.fork(path.join(__dirname, 'cucumber-wrapper.js'), execOptions, {
    env: process.env
  });



  self.cucumberChild.on('close', function (code) {
    log.debug('[cucumber] Closed with code', code);
    if (!self.cucumberChild.interrupted) {
      callback(code !== 0 ? 'Cucumber steps failed' : null);
    }
  });

  // TODO make an IPC pass-through for meteor-cucumber

};

Cucumber.prototype.interrupt = function (callback) {

  var self = this;

  if (!self.cucumberChild) {
    return;
  }

  self.cucumberChild.interrupted = true;
  self.cucumberChild.kill('SIGINT');

  if (callback) {
    var waitForProcessToDie = setInterval(function () {
      try {
        process.kill(self.cucumberChild.pid, 0);
      } catch (e) {
        self.cucumberChild = null;
        clearInterval(waitForProcessToDie);
        callback();
      }
    }, 100);
  }
};

function _getExecOptions (options) {
  var execOptions = ['node', path.resolve(__dirname, path.join('..', 'node_modules', '.bin', 'cucumber.js'))];

  // XXX a feature may be defined at the start or end
  // XXX do other options also get passed with this command?
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
