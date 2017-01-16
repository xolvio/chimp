var phantomjs = require('phantomjs-prebuilt'),
  processHelper = require('./process-helper.js'),
  log = require('./log');

/**
 * Phantom Constructor
 *
 * @param {Object} options
 * @api public
 */
function Phantom(options) {
  if (!options) {
    throw new Error('options is required');
  }

  if (!options.port) {
    throw new Error('options.port is required');
  }

  this.options = options;

  this.child = null;
}

/**
 * Start Phantom
 *
 * @param {Function} callback
 * @api public
 */
Phantom.prototype.start = function (callback) {
  var self = this;
  var port = self.options.port;
  var ignoreSSLErrors = self.options.phantom_ignoreSSLErrors || 'false';

  if (this.child) {
    callback();
    return;
  }

  this.child = processHelper.start({
    bin: process.env['chimp.phantom_path'] || phantomjs.path,
    prefix: 'phantom',
    args: ['--webdriver', port, '--ignore-ssl-errors', ignoreSSLErrors],
    waitForMessage: /GhostDriver - Main - running on port/,
    errorMessage: /Error/
  }, callback);

};

/**
 * Stop Phantom
 *
 * @param {Function} callback
 * @api public
 */
Phantom.prototype.stop = function (callback) {
  var self = this;

  if (self.child) {
    log.debug('[chimp][phantom] stopping process');

    var options = {
      child: self.child,
      prefix: 'phantom'
    };

    processHelper.kill(options, function (err, res) {
      self.child = null;
      callback(err, res);
    });

  } else {
    log.debug('[chimp][phantom] no process to kill');
    callback(null);
  }

};

/**
 * Interrupt Phantom
 *
 * @param {Function} callback
 * @api public
 */
Phantom.prototype.interrupt = function (callback) {
  this.stop(callback);
};

module.exports = Phantom;
