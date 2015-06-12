var _             = require('underscore'),
    processHelper = require('./process-helper.js'),
    selenium      = require('selenium-standalone'),
    log           = require('./log');

/**
 * Selenium Constructor
 *
 * @param {Object} options
 * @api public
 */
function Selenium (options) {

  if (!options) {
    throw new Error('options is required');
  }

  if (!options.port) {
    throw new Error('options.port is required');
  }

  this.options = _.clone(options);

  if (!this.options['clean-selenium-server']) {
    // poor-man's singleton is enough for our needs
    if (typeof Selenium.instance === 'object') {
      log.debug('[chimp][selenium]', 'Selenium object already exists, not creating a new one');
      return Selenium.instance;
    }
    log.debug('[chimp][selenium]', 'Selenium object created');
    Selenium.instance = this;
  }

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

  log.debug('[chimp][selenium]', 'Installing Selenium + drivers if needed');
  selenium.install({
    // check for more recent versions of selenium here:
    // http://selenium-release.storage.googleapis.com/index.html
    version: '2.46.0',
    baseURL: 'http://selenium-release.storage.googleapis.com',
    drivers: {
      chrome: {
        // check for more recent versions of chrome driver here:
        // http://chromedriver.storage.googleapis.com/index.html
        version: '2.16',
        arch: process.arch,
        baseURL: 'http://chromedriver.storage.googleapis.com'
      },
      ie: {
        // check for more recent versions of internet explorer driver here:
        // http://selenium-release.storage.googleapis.com/index.html
        version: '2.46',
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

  log.debug('[chimp][selenium]', 'Start');

  if (self.child) {
    log.debug('[chimp][selenium]', 'Already running, doing nothing');
    callback(null);
    return;
  }

  self.install(function (error) {
    if (error) {
      log.error('[selenium]', error);
      callback(error);
      return;
    }

    var seleniumOptions = {
      seleniumArgs: [
        '-port', port
      ]
    };
    if (self.options.seleniumDebug) {
      seleniumOptions.seleniumArgs.push('-debug');
    }

    log.debug('\n[chimp][selenium] hub can be seen at http://localhost:' + port + '/wd/hub');

    selenium.start(seleniumOptions, function (error, seleniumChild) {

      self.child = seleniumChild;

      if (error) {
        callback(error);
        return;
      }

      if (self.options.seleniumDebug) {
        processHelper.logOutputs('selenium', self.child);
      }

      process.on('exit', function () {
        self.stop();
      });

      callback(null);
    });
  });
};

Selenium.prototype.stop = function (callback) {

  log.debug('[chimp][selenium]', 'Stopping');

  var self = this,
      error = null;

  if (self.child) {
    try {
      process.kill(-self.child.pid, 'SIGINT');
    } catch (e) {
      if (e.code !== 'ESRCH') {
        error = e;
      }
    }

    self.child = null;
  }

  if (callback) {
    callback(error);
  }

};

Selenium.prototype.interrupt = function (callback) {
  if (!!this.options['clean-selenium-server']) {
    this.stop(callback);
  } else {
    callback(null);
  }
};

module.exports = Selenium;
