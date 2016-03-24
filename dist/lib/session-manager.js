'use strict';

var requestretry = require('requestretry'),
    request = require('request'),
    log = require('./log'),
    booleanHelper = require('./boolean-helper');

/**
 * SessionManager Constructor
 *
 * @param {Object} options
 * @api public
 */
function SessionManager(options) {

  log.debug('[chimp][session-manager] options are', options);

  if (!options) {
    throw new Error('options is required');
  }

  if (!options.port) {
    throw new Error('options.port is required');
  }

  if (!options.browser && !options.deviceName) {
    throw new Error('[chimp][session-manager] options.browser or options.deviceName is required');
  }

  this.options = options;

  this.maxRetries = 30;
  this.retryDelay = 3000;
  this.retry = 0;

  log.debug('[chimp][session-manager] created a new SessionManager', options);
}

SessionManager.prototype.webdriver = require('xolvio-sync-webdriverio');

/**
 * Wraps the webdriver remote method and allows reuse options
 *
 * @api public
 */
SessionManager.prototype.remote = function (webdriverOptions, callback) {

  var self = this;

  log.debug('[chimp][session-manager] creating webdriver remote ');
  var browser = this.webdriver.remote(webdriverOptions);

  function decideReuse() {

    if (self.options.browser === 'phantomjs') {
      log.debug('[chimp][session-manager] browser is phantomjs, not reusing a session');
      callback(null, browser);
      return;
    }

    if (booleanHelper.isTruthy(process.env['chimp.noSessionReuse'])) {
      log.debug('[chimp][session-manager] noSessionReuse is true, not reusing a session');
      callback(null, browser);
      return;
    }

    if (booleanHelper.isFalsey(process.env['chimp.watch']) && booleanHelper.isFalsey(process.env['chimp.server'])) {
      log.debug('[chimp][session-manager] watch mode is false, not reusing a session');
      callback(null, browser);
      return;
    }

    self._getWebdriverSessions(function (err, sessions) {
      if (err) {
        callback(err);
        return;
      }
      if (sessions.length !== 0) {
        log.debug('[chimp][session-manager] Found an open selenium sessions, reusing session', sessions[0].id);
        browser._original.requestHandler.sessionID = sessions[0].id;
      } else {
        log.debug('[chimp][session-manager] Did not find any open selenium sessions, not reusing a session');
      }

      browser = self._monkeyPatchBrowserSessionManagement(browser, sessions);
      callback(null, browser);
    });
  }

  this._waitForConnection(browser, decideReuse);
};

SessionManager.prototype._waitForConnection = function (browser, callback) {
  log.debug('[chimp][session-manager] checking connection to selenium server');
  var self = this;
  browser.statusAsync().then(function () {
    log.debug('[chimp][session-manager] Connection to the to selenium server verified');
    callback();
  }, function (err) {
    if (err && /ECONNREFUSED/.test(err.message)) {
      if (++self.retry === self.maxRetries) {
        callback('[chimp][session-manager] timed out retrying to connect to selenium server');
      }
      log.debug('[chimp][session-manager] could not connect to the server, retrying', '(' + self.retry + '/' + self.maxRetries + ')');
      setTimeout(function () {
        self._waitForConnection(browser, callback);
      }, self.retryDelay);
    } else {
      log.debug('[chimp][session-manager] Connection to the to selenium server verified');
      callback();
    }
  });
};

SessionManager.prototype._monkeyPatchBrowserSessionManagement = function (browser, sessions) {

  log.debug('[chimp][session-manager]', 'monkey patching the browser object');

  var callbacker = function callbacker() {
    var cb = arguments[arguments.length - 1];
    if (cb && typeof cb === 'function') {
      cb();
    }
    return {
      then: function then(c) {
        c();
      }
    };
  };

  var initWrapperFactory = function initWrapperFactory(init) {
    return function () {
      if (sessions.length !== 0) {
        log.debug('[chimp][session-manager]', 'browser already initialized');
        return callbacker.apply(this, arguments);
      } else {
        log.debug('[chimp][session-manager]', 'initializing browser');
        return init.apply(this, arguments);
      }
    };
  };

  browser._initAsync = browser.initAsync;
  browser.initAsync = initWrapperFactory(browser.initAsync);
  browser._initSync = browser.initSync;
  browser.initSync = initWrapperFactory(browser.initSync);
  browser._init = browser.init;
  if (browser._init === browser._initSync) {
    browser.init = browser.initSync;
  } else if (browser._init === browser._initAsync) {
    browser.init = browser.initAsync;
  } else {
    throw new Error('browser.init has already been overwritten by something else.');
  }

  browser.end = callbacker.bind(browser);
  browser.endSync = browser.end;
  browser.endAsync = browser.end;

  browser.endAll = callbacker.bind(browser);
  browser.endAllSync = browser.endAll;
  browser.endAllAsync = browser.endAll;

  return browser;
};

/**
 * Gets a list of sessions from the localhost selenium server
 *
 * @api private
 */
SessionManager.prototype._getWebdriverSessions = function (callback) {

  var wdHubSessions = 'http://' + this.options.host + ':' + this.options.port + '/wd/hub/sessions';

  log.debug('[chimp][session-manager]', 'requesting sessions from', wdHubSessions);

  requestretry({
    url: wdHubSessions,
    maxAttempts: 10,
    retryDelay: 500,
    retryStrategy: requestretry.RetryStrategies.HTTPOrNetworkError
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      log.debug('[chimp][session-manager]', 'received data', body);
      callback(null, JSON.parse(body).value);
    } else {
      log.error('[chimp][session-manager]', 'received error', error, 'response', response);
      callback(error);
    }
  });
};

/**
 * Kills the 1st session found running on selenium server
 *
 * @api public
 */
SessionManager.prototype.killCurrentSession = function (callback) {

  if (this.options.browser === 'phantomjs') {
    log.debug('[chimp][session-manager] browser is phantomjs, not killing session');
    callback();
    return;
  }

  if (!process.env['chimp.noSessionReuse']) {
    log.debug('[chimp][session-manager] noSessionReuse is true, , not killing session');
    callback();
    return;
  }

  if (process.env['chimp.watch'] === 'true' || process.env['chimp.server'] === 'true') {
    log.debug('[chimp][session-manager] watch / server mode are true, not killing session');
    callback();
    return;
  }

  var wdHubSession = 'http://' + this.options.host + ':' + this.options.port + '/wd/hub/session';

  this._getWebdriverSessions(function (err, sessions) {

    if (sessions.length) {
      // XXX this currently only works for one open session at a time
      var sessionId = sessions[0].id;

      log.debug('[chimp][session-manager]', 'deleting wd session', sessionId);

      request.del(wdHubSession + '/' + sessionId, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          log.debug('[chimp][session-manager]', 'received data', body);
          callback();
        } else {
          log.error('[chimp][session-manager]', 'received error', error);
          callback(error);
        }
      });
    } else {
      callback(null);
    }
  });
};

module.exports = SessionManager;