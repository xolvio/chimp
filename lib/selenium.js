var _             = require('underscore'),
    processHelper = require('./process-helper.js'),
    selenium      = require('selenium-standalone'),
    log           = require('loglevel');

/**
 * Selenium Constructor
 *
 * @param {Object} options
 * @api public
 */
function Selenium (options) {

  log.debug('[selenium]', 'Selenium object created');

  if (!options) {
    throw new Error('options is required');
  }

  if (!options.port) {
    throw new Error('options.port is required');
  }

  this.options = _.clone(options);

  this.options.port = String(options.port);

  this.child = null;
}

/**
 * Installs Selenium and drivers.
 *
 * @param {Function} callback
 * @api public
 */
Selenium.prototype.install = function (callback) {
  var ProgressBar = require('progress');
  var bar;
  var firstProgress = true;

  selenium.install({
    // check for more recent versions of selenium here:
    // http://selenium-release.storage.googleapis.com/index.html
    version: '2.45.0',
    baseURL: 'http://selenium-release.storage.googleapis.com',
    drivers: {
      chrome: {
        // check for more recent versions of chrome driver here:
        // http://chromedriver.storage.googleapis.com/index.html
        version: '2.15',
        arch: process.arch,
        baseURL: 'http://chromedriver.storage.googleapis.com'
      },
      ie: {
        // check for more recent versions of internet explorer driver here:
        // http://selenium-release.storage.googleapis.com/index.html
        version: '2.45',
        arch: process.arch,
        baseURL: 'http://selenium-release.storage.googleapis.com'
      }
    },
    progressCb: progressCb
  }, callback);

  function progressCb (total, progress, chunk) {
    if (firstProgress) {
      console.log('');
      console.log('');
      firstProgress = false;
    }

    bar = bar || new ProgressBar(
      'selenium-standalone installation [:bar] :percent :etas', {
        total: total,
        complete: '=',
        incomplete: ' ',
        width: 20
      });

    bar.tick(chunk);
  }
};

/**
 * Start Selenium process.
 *
 * It also installs Selenium if necessary.
 *
 * @param {Function} callback
 * @api public
 */
Selenium.prototype.start = function (callback) {
  var self = this;
  var port = self.options.port;


  log.debug('[selenium]', 'self.child', self.child)
  if (self.child) {
    callback(null);
    return;
  }

  self.install(function (error) {
    if (error) {
      callback(error);
      return;
    }

    var seleniumOptions = {
      seleniumArgs: [
        '-port', port
      ]
    };

    log.debug('[selenium] hub can be seen at http://localhost:' + port + '/wd/hub');

    selenium.start(seleniumOptions, function (error, seleniumChild) {

      self.child = seleniumChild;

      if (error) {
        callback(error);
        return;
      }

      //processHelper.logOutputs('[selenium]', self.child);

      callback(null);
    });
  });
};

Selenium.prototype.stop = function (callback) {

  log.error('****** STOP CALLED')

  var self = this;

  if (self.child) {
    self.child.kill();
    self.child = null;
  }

  callback(null);

};

Selenium.prototype.interrupt = function (callback) {
  if (!!this.options['clean-selenium-server']) {
    this.stop(callback);
  } else {
    callback(null);
  }
};

module.exports = Selenium;
