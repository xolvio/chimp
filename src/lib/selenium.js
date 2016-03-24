var _              = require('underscore'),
    processHelper  = require('./process-helper.js'),
    selenium       = require('selenium-standalone'),
    SessionManager = require('./session-manager.js'),
    booleanHelper   = require('./boolean-helper'),
    log            = require('./log');

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

  if (booleanHelper.isFalsey(options.port)) {
    throw new Error('options.port is required');
  }

  this.options = _.clone(options);

  this.seleniumStandaloneOptions = {
    // check for more recent versions of selenium here:
    // http://selenium-release.storage.googleapis.com/index.html
    version: '2.50.1',
    baseURL: 'https://selenium-release.storage.googleapis.com',
    drivers: {
      chrome: {
        // check for more recent versions of chrome driver here:
        // http://chromedriver.storage.googleapis.com/index.html
        version: '2.20',
        arch: process.arch,
        baseURL: 'https://chromedriver.storage.googleapis.com'
      },
      ie: {
        // check for more recent versions of internet explorer driver here:
        // http://selenium-release.storage.googleapis.com/index.html
        version: '2.50.0',
        arch: 'ia32',
        baseURL: 'https://selenium-release.storage.googleapis.com'
      }
    }
  };

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
  this.sessionManager = null;
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

  // XXX we need to check if the current versions are already installed before going to the web

  if (this.options.offline) {
    log.debug('[chimp][selenium]', 'Offline mode enabled, Chimp will not attempt to install Selenium & Drivers');
    callback();
    return;
  }

  log.debug('[chimp][selenium]', 'Installing Selenium + drivers if needed');

  this.seleniumStandaloneOptions.progressCb = progressCb;
  selenium.install(this.seleniumStandaloneOptions, callback);

  function progressCb (total, progress, chunk) {
    if (firstProgress) {
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

    self.seleniumStandaloneOptions.seleniumArgs = ['-port', port];

    if (process.env['chimp.log'] === 'verbose' || process.env['chimp.log'] === 'debug') {
      self.options.seleniumDebug = true;
    }

    if (self.options.seleniumDebug) {
      self.seleniumStandaloneOptions.seleniumArgs.push('-debug');
    }

    log.debug('\n[chimp][selenium] hub can be seen at http://localhost:' + port + '/wd/hub');

    selenium.start(self.seleniumStandaloneOptions, function (error, seleniumChild) {

      self.child = seleniumChild;

      if (error) {
        callback(error);
        return;
      }

      if (self.options.seleniumDebug) {
        processHelper.logOutputs('selenium', self.child);
      }

      process.on('exit', function () {
        log.debug('[chimp][selenium] process exit event detected. Stopping process');
        self.stop(function () {
          log.debug('[chimp][selenium] process exit event stop complete');
        });
      });

      self.sessionManager = new SessionManager({
        host: process.env['chimp.host'],
        port: process.env['chimp.port'],
        browser: process.env['chimp.browser'],
        deviceName: process.env['chimp.deviceName']
      });

      callback(null);
    });
  });
};

Selenium.prototype.stop = function (callback) {

  var self = this;

  if (self.child) {

    log.debug('[chimp][selenium] killing active session');

      var options = {
        child: self.child,
        prefix: 'selenium',
        signal: 'SIGINT'
      };

      log.debug('[chimp][selenium] stopping process');
      processHelper.kill(options, function (err, res) {
        self.child = null;
        callback(err, res);
      });

  } else {
    log.debug('[chimp][selenium] no process to kill');
    callback(null);
  }

};

Selenium.prototype.interrupt = function (callback) {
  log.debug('[chimp][selenium] interrupt called');
  if (!!this.options['clean-selenium-server']) {
    this.stop(callback);
  } else {
    log.debug('[chimp][selenium] interrupt is not killing selenium because ' +
      'clean-selenium-server not set');
    callback(null);
  }
};

module.exports = Selenium;
