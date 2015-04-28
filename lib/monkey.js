/**
 * Externals
 */
var async = require('async'),
path      = require('path'),
chokidar  = require('chokidar'),
_         = require('underscore'),
log       = require('loglevel');

log.setLevel('debug');

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
  this.isRerunning = false;

  // store all cli parameters in env hash
  for (var option in options) {
    process.env["monkey." + option] = options[option];
  }

  log.debug('[cuke-monkey]', 'Running with the following options', options);
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

      log.debug('[cuke-monkey] file changed, running');
      self.rerun();

    });

    log.debug('[cuke-monkey] watcher ready, running for the first time');
    self.run(function (err, res) {
      if (err) {
        log.error('[cuke-monkey] first watch run completed with errors', err);
      } else {
        log.debug('[cuke-monkey] first watch run completed with no errors');
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

  log.info('[cuke-monkey] Cuke-monkey is running');

  var self = this;

  async.series([
    self.interrupt.bind(self),
    self._startProcesses.bind(self),
    self.interrupt.bind(self)
  ], callback);

};

/**
 * Interrupts any running specs in the reverse order. This allows cucumber to shut down first
 * before webdriver servers, otherwise we can get test errors in the console
 *
 * @api public
 */
Monkey.prototype.interrupt = function (callback) {
  log.debug('[cuke-monkey] Interrupt');

  var self = this;

  if (!self.processes || self.processes.length === 0) {
    callback();
    return;
  }

  log.debug('[cuke-monkey] interrupting', self.processes.length, 'processes');

  var reverseProcesses = [];
  while (self.processes.length !== 0) {
    reverseProcesses.push(self.processes.pop());
  }

  var processes = _.collect(reverseProcesses, function (process) {
    return process.interrupt.bind(process)
  });


  async.series(processes, callback);

};

/**
 * Combines the interrupt and run methods and latches calls
 *
 * @api public
 */
Monkey.prototype.rerun = function () {
  var self = this;

  if (self.isRerunning) {
    log.debug('[cuke-monkey] interrupt in progress, ignoring ');
    return;
  }
  self.isRerunning = true;

  self.run(function () {
    self.isRerunning = false;
  });
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

  // pushing at least one processes guarantees the series below runs
  processes.push(function (callback) {
    log.debug('[cuke-monkey] Finished running async processes');
    callback();
  });

  async.series(processes, function (err, res) {
    if (err) {
      log.error('[cuke-monkey] Finished running async processes with errors');
    }
    callback(err, res);
  });

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

module.exports = Monkey;
