/*!
 * Monkey
 */

/**
 * Externals
 */
var async = require('async'),
path      = require('path'),
chokidar  = require('chokidar'),
_         = require('underscore'),
log       = require('loglevel');

/**
 * Internals
 */
exports.Cucumber = require('./cucumber.js');
exports.Phantom = require('./phantom.js');
exports.Selenium = require('./selenium.js');

/**
 * Exposes the binary path
 *
 * @api public
 */
Monkey.bin = path.resolve(__dirname, path.join('..', 'bin', 'cuke-monkey'));

/**
 * Monkey Constructor
 *
 * Options:
 *    - `browser` browser to run tests in
 *
 * @param {Object} options
 * @api public
 */
function Monkey (options) {

  this.chokidar = chokidar;
  this.options = options || {};
  this.processes = [];

  // store all cli parameters in env hash
  for (var option in options) {
    process.env["monkey." + option] = options[option];
  }
}

/**
 * Decides which mode to run and kicks it off
 *
 * @param {Function} callback
 * @api public
 */
Monkey.prototype.init = function (callback) {

  if (this.options.watch) {
    this.watch();
  } else if (this.options.server) {
    this.start();
  } else {
    this.run(callback);
  }

};

/**
 * Watches the file system for changes and reruns when it detects them
 *
 * @api public
 */
Monkey.prototype.watch = function () {

  var watcher = chokidar.watch(this.options.path, {
    ignored: /[\/\\]\./,
    persistent: true
  });

  var self = this;

  // wait for initial file scan to complete
  watcher.on('ready', function () {

    log.info('[cuke-monkey] is watching your files');

    // start watching
    watcher.on('all', function (event, path) {

      // removing feature files should not rerun
      if (event === 'unlink' && path.match(/\.feature$/)) {
        return;
      }

      self._interruptAndRun();

    });

    self.run(function (err, res) {
      if (err) {
        console.error('Initial run failed.', err);
      }
    });

  });

};

/**
 * Starts servers and runs specs
 *
 * @api public
 */
Monkey.prototype.run = function (callback) {

  log.info('[cuke-monkey] is running');

  var self = this;

  self.interrupt(function (err) {
    if (err) {
      callback(err);
    }
    else {
      self._startProcesses(callback);
    }
  });

};

/**
 * Interrupts any running specs in the reverse order. This allows cucumber to shut down first
 * before webdriver servers, otherwise we can get test errors in the console
 *
 * @api public
 */
Monkey.prototype.interrupt = function (callback) {

  var reverseProcesses = [];
  while (this.processes.length !== 0) {
    reverseProcesses.push(this.processes.pop());
  }

  var processes = _.collect(reverseProcesses, function (process) {
    return process.interrupt.bind(process)
  });
  async.series(processes, callback);

};

/**
 * Starts processes in series
 *
 * @api private
 */
Monkey.prototype._startProcesses = function (callback) {

  this.processes = this._createProcesses();

  var processes = _.collect(this.processes, function (process) {
    return process.start.bind(process)
  });

  async.series(processes, callback);

};

/**
 * Creates the correct sequence of servers needed prior to running cucumber
 *
 * @api private
 */
Monkey.prototype._createProcesses = function () {

  var processes = [];

  if (this.options.browser === 'phantomjs') {
    var phantom = new exports.Phantom(this.options);
    processes.push(phantom);
  }

  else if (!this.options.host.match(/saucelabs/)) {
    var selenium = new exports.Selenium(this.options);
    processes.push(selenium);
  }

  var cucumber = new exports.Cucumber(this.options);
  processes.push(cucumber);

  return processes;

};

/**
 * Simple method that combines the interrupt and run methods
 *
 * @api private
 */
Monkey.prototype._interruptAndRun = function () {
  var self = this;
  self.interrupt(function (err) {
    if (err) {
      log.error('Could not interrupt processes.');
    } else {
      self.run(function (err, res) {
        if (err) {
          log.error('Could not run processes.');
        }
      });
    }
  });
};

module.exports = Monkey;
