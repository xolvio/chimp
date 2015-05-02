/**
 * Externals
 */
var async = require('async'),
path      = require('path'),
chokidar  = require('chokidar'),
_         = require('underscore'),
log       = require('./log');

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
  this.isInterrupting = false;

  // store all cli parameters in env hash
  for (var option in options) {
    process.env['monkey.' + option] = options[option];
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

  // set cucumber tags to be watch based
  if (!!self.options.watchTags) {
    self.options.tags = self.options.watchTags;
  }

  // wait for initial file scan to complete
  watcher.on('ready', function () {

    log.info('[cuke-monkey][monkey] Watching features with tagged with', self.options.watchTags);

    // start watching
    watcher.on('all', function (event, path) {

      // removing feature files should not rerun
      if (event === 'unlink' && path.match(/\.feature$/)) {
        return;
      }

      log.debug('[cuke-monkey][monkey] file changed');
      self.rerun();

    });

    log.debug('[cuke-monkey][monkey] watcher ready, running for the first time');
    self.rerun();

  });

};

/**
 * Starts servers and runs specs
 *
 * @api public
 */
Monkey.prototype.run = function (callback) {

  log.info('[cuke-monkey][monkey] Running...');

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

  log.debug('[cuke-monkey][monkey] interrupting');

  var self = this;

  self.isInterrupting = true;

  if (!self.processes || self.processes.length === 0) {
    self.isInterrupting = false;
    log.debug('[cuke-monkey][monkey] no processes to interrupt');
    callback();
    return;
  }

  log.debug('[cuke-monkey][monkey]', self.processes.length, 'processes to interrupt');

  var reverseProcesses = [];
  while (self.processes.length !== 0) {
    reverseProcesses.push(self.processes.pop());
  }

  var processes = _.collect(reverseProcesses, function (process) {
    return process.interrupt.bind(process)
  });

  async.series(processes, function (error, r) {
    self.isInterrupting = false;
    log.debug('[cuke-monkey][monkey] Finished interrupting processes');
    if (error) {
      log.error('[cuke-monkey][monkey] with errors', error);
    }
    callback.apply(this, arguments);
  });

};

/**
 * Combines the interrupt and run methods and latches calls
 *
 * @api public
 */
Monkey.prototype.rerun = function () {

  log.debug('[cuke-monkey][monkey] rerunning');

  var self = this;

  if (self.isInterrupting) {
    log.debug('[cuke-monkey][monkey] interrupt in progress, ignoring rerun');
    return;
  }

  self.run(function () {
    log.debug('[cuke-monkey][monkey] finished rerun');
  });
};

/**
 * Starts processes in series
 *
 * @api private
 */
Monkey.prototype._startProcesses = function (callback) {

  var self = this;

  self.processes = self._createProcesses();

  var processes = _.collect(self.processes, function (process) {
    return process.start.bind(process)
  });

  // pushing at least one processes guarantees the series below runs
  processes.push(function (callback) {
    log.debug('[cuke-monkey][monkey] Finished running async processes');
    callback();
  });

  async.series(processes, function (err, res) {
    if (err) {
      self.isInterrupting = false;
      log.error('[cuke-monkey][monkey] Finished running async processes with errors');
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
