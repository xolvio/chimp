var requestretry = require('requestretry'),
  request = require('request'),
  log = require('./log'),
  booleanHelper = require('./boolean-helper'),
  parseBoolean = require('./environment-variable-parsers').parseBoolean;

/**
 * SessionManager Constructor
 *
 * @param {Object} options
 * @api public
 */
function SessionManager(options) {

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

  log.debug('[chimp][session-manager] created a new SessionManager');

}

SessionManager.prototype.webdriver = require('xolvio-sync-webdriverio');

/**
 * Wraps the webdriver remote method and allows reuse options
 *
 * @api public
 */

SessionManager.prototype._configureRemote = function (webdriverOptions, remote, callback) {
  var self = this;

  log.debug('[chimp][session-manager] creating webdriver remote ');

  var browser = remote(webdriverOptions);
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

SessionManager.prototype.multiremote = function (webdriverOptions, callback) {
  this._configureRemote(webdriverOptions, this.webdriver.multiremote, callback);
};

SessionManager.prototype.remote = function (webdriverOptions, callback) {
  this._configureRemote(webdriverOptions, this.webdriver.remote, callback);
};


SessionManager.prototype._waitForConnection = function (browser, callback) {
  log.debug('[chimp][session-manager] checking connection to selenium server');
  var self = this;
  browser.statusAsync().then(
    () => {
      log.debug('[chimp][session-manager] Connection to the to selenium server verified');
      callback();
    },
    (err) => {
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
    }
  );
};


SessionManager.prototype._monkeyPatchBrowserSessionManagement = function (browser, sessions) {

  log.debug('[chimp][session-manager]', 'monkey patching the browser object');

  var callbacker = function () {
    var cb = arguments[arguments.length - 1];
    if (cb && typeof cb === 'function') {
      cb();
    }
    return {
      then: function (c) {
        c();
      }
    };
  };

  var initWrapperFactory = function (init) {
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

  var updateBrowserObject = function (browserObject) {
    browserObject._initAsync = browserObject.initAsync;
    browserObject.initAsync = initWrapperFactory(browserObject.initAsync);
    browserObject._initSync = browserObject.initSync;
    browserObject.initSync = initWrapperFactory(browserObject.initSync);
    browserObject._init = browserObject.init;
    if (browserObject._init === browserObject._initSync) {
      browserObject.init = browserObject.initSync;
    } else if (browserObject._init === browserObject._initAsync) {
      browserObject.init = browserObject.initAsync;
    } else {
      throw new Error('browserObject.init has already been overwritten by something else.');
    }

    browserObject.end = callbacker.bind(browserObject);
    browserObject.endSync = browserObject.end;
    browserObject.endAsync = browserObject.end;

    browserObject.endAll = callbacker.bind(browserObject);
    browserObject.endAllSync = browserObject.endAll;
    browserObject.endAllAsync = browserObject.endAll;

    return browserObject;
  };

  if (browser.instances) {
    browser.instances.forEach(function (singleBrowser) {
      singleBrowser = updateBrowserObject(singleBrowser);
    });
  }
  else {
    browser = updateBrowserObject(browser);
  }

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
    if (!error) {
      if (response.statusCode === 200) {
        log.debug('[chimp][session-manager]', 'received data', body);
        callback(null, JSON.parse(body).value);
      } else {
        log.error('[chimp][session-manager]', 'received error', `${response.statusMessage} [${response.statusCode}]`);
        if (response.body) {
          log.debug('[chimp][session-manager]', 'response', response.body);
        }
        callback(error);
      }
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

  if ((parseBoolean(process.env['chimp.watch']) || parseBoolean(process.env['chimp.server']))
    && !parseBoolean(process.env['forceSessionKill'])) {
    log.debug('[chimp][session-manager] watch / server mode are true, not killing session');
    callback();
    return;
  }


  var wdHubSession = 'http://' + this.options.host + ':' + this.options.port + '/wd/hub/session';

  this._getWebdriverSessions(function (err, sessions) {

    if (sessions && sessions.length) {
      sessions.forEach(function (session) {
        var sessionId = session.id;
        log.debug('[chimp][session-manager]', 'deleting wd session', sessionId);

        request.del(wdHubSession + '/' + sessionId, function (error, response, body) {
          if (!error && response.statusCode === 200) {
            log.debug('[chimp][session-manager]', 'received data', body);
            callback();
          } else {
            log.error('[chimp][session-manager]', 'received error', error);
            callback(error);
          }
        });
      });
    } else {
      callback(null);
    }

  });


};

module.exports = SessionManager;
