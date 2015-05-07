var request = require('request'),
    log     = require('./log'),
    wd      = require('webdriverio');

/**
 * SessionManager Constructor
 *
 * @param {Object} options
 * @api public
 */
function SessionManager (options) {

  if (!options) {
    throw new Error('options is required');
  }

  if (!options.port) {
    throw new Error('options.port is required');
  }

  if (!options.browser) {
    throw new Error('options.browser is required');
  }

  this.options = options;

  log.debug('[cuke-monkey][session-manager] created a new SessionManager', options);

}

/**
 * Wraps the webdriver remote method and allows reuse options
 *
 * @api public
 */
SessionManager.prototype.remote = function (webdriverOptions, callback) {

  log.debug('[cuke-monkey][session-manager] creating webdriver remote ');
  var browser = wd.remote(webdriverOptions);

  if (this.options.browser === 'phantomjs') {
    log.debug('[cuke-monkey][session-manager] browser is phantomjs, not reusing a session');
    callback(null, browser);
    return;
  }

  if (!!process.env['no-session-reuse']) {
    log.debug('[cuke-monkey][session-manager] no-session-reuse is true, not reusing a session');
    callback(null, browser);
    return;
  }

  if (!process.env['monkey.watch'] && !process.env['monkey.server']) {
    log.debug('[cuke-monkey][session-manager] watch mode is false, not reusing a session');
    callback(null, browser);
    return;
  }

  var self = this;
  this._getWebdriverSessions(function(err, sessions){
    if (sessions.length !== 0) {
      log.debug('[cuke-monkey][session-manager] Found an open selenium sessions, reusing session', sessions[0].id);
      browser.requestHandler.sessionID = sessions[0].id;
    }

    log.debug('[cuke-monkey][session-manager] Did not find any open selenium sessions, not reusing a session');
    browser = self._monkeyPatchBrowserSessionManagement(browser, sessions);
    callback(null, browser);
  });


};

SessionManager.prototype._monkeyPatchBrowserSessionManagement = function (browser, sessions) {

  log.debug('[cuke-monkey][session-manager]', 'monkey patching the browser object');

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

  browser._init = browser.init;
  browser.init = function () {
    if (sessions.length !== 0) {
      log.debug('[cuke-monkey][session-manager]', 'browser already initialized');
      return callbacker.apply(this, arguments);
    }
    log.debug('[cuke-monkey][session-manager]', 'initializing browser');
    return browser._init.apply(this, arguments);
  };

  browser._end = browser.end;
  browser.end = callbacker.bind(browser);

  browser._endAll = browser.end;
  browser.endAll = callbacker.bind(browser);

  return browser;

};

/**
 * Gets a list of sessions from the localhost selenium server
 *
 * @api public
 */
SessionManager.prototype._getWebdriverSessions = function (callback) {

  var wdHubSessions = 'http://localhost:' + this.options.port + '/wd/hub/sessions';

  log.debug('[cuke-monkey][session-manager]', 'requesting sessions from', wdHubSessions);

  request(wdHubSessions, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      log.debug('[cuke-monkey][session-manager]', 'received data', body);
      callback(null, JSON.parse(body).value);
    } else {
      log.error('[cuke-monkey][session-manager]', 'received error', error);
      callback(error);
    }
  });

};

module.exports = SessionManager;