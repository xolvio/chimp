var request = require('request'),
  log = require('./log');

/**
 * SessionManager Constructor
 *
 * @param {Object} options
 * @api public
 */
function BrowserStackSessionManager(options) {

  log.debug('[chimp][browserstack-session-manager] options are', options);

  var host = options.host.replace(/hub\.|hub-cloud\./, 'www.');
  var browserStackBaseUrl = 'https://' + options.user + ':' + options.key + '@' + host;
  options.browserStackUrl = browserStackBaseUrl;

  this.options = options;

  this.maxRetries = 30;
  this.retryDelay = 3000;
  this.retry = 0;

  log.debug('[chimp][browserstack-session-manager] created a new SessionManager', options);

}

BrowserStackSessionManager.prototype.webdriver = require('xolvio-sync-webdriverio');

/**
 * Wraps the webdriver remote method and allows reuse options
 *
 * @api public
 */
BrowserStackSessionManager.prototype.remote = function (webdriverOptions, callback) {

  var self = this;

  log.debug('[chimp][browserstack-session-manager] creating webdriver remote ');
  var browser = this.webdriver.remote(webdriverOptions);

  callback(null, browser);
  return;
};

/**
 * Gets a list of builds from the BrowserStack API as sessions must be queried based on Builds
 *
 * @api private
 */
BrowserStackSessionManager.prototype._getBuilds = function (callback) {
  var hub = this.options.browserStackUrl + '/automate/builds.json?status=running';

  log.debug('[chimp][browserstack-session-manager]', 'requesting builds from', hub);

  request(hub, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      log.debug('[chimp][browserstack-session-manager]', 'received data', body);
      callback(null, JSON.parse(body));
    } else {
      log.error('[chimp][browserstack-session-manager]', 'received error', error);
      callback(error);
    }
  });
};

/**
 * Gets a list of sessions from the BrowserStack API based on Build ID
 *
 * @api private
 */
BrowserStackSessionManager.prototype._getSessions = function (buildId, callback) {
  var hub = this.options.browserStackUrl + '/automate/builds/' + buildId + '/sessions.json?status=running';

  log.debug('[chimp][browserstack-session-manager]', 'requesting sessions from', hub);

  request(hub, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      log.debug('[chimp][browserstack-session-manager]', 'received data', body);
      callback(null, JSON.parse(body));
    } else {
      log.error('[chimp][browserstack-session-manager]', 'received error', error);
      callback(error);
    }
  });
};

/**
 * Kills the 1st session found running on BrowserStack
 *
 * @api public
 */
BrowserStackSessionManager.prototype.killCurrentSession = function (callback) {

  this._getBuilds(function (err, builds) {
    if (builds && builds.length) {
      log.debug('[chimp][browserstack-session-manager]', builds, builds[0]);
      var buildId = builds[0].automation_build.hashed_id;
    }
    if (buildId !== '') {
      this._getSessions(buildId, function (err, sessions) {
        if (sessions && sessions.length) {
          var options = {
            url: this.options.browserStackUrl + '/automate/sessions/' + sessions[0].automation_session.hashed_id + '.json',
            method: 'PUT',
            json: true,
            body: { status: 'completed' }
          };

          request(options, function (error, response) {
            if (!error && response.statusCode === 200) {
              log.debug('[chimp][browserstack-session-manager]', 'stopped session');
              callback();
            } else {
              log.error('[chimp][browserstack-session-manager]', 'received error', error);
              callback(error);
            }
          });
        }
      }.bind(this));
    }
  }.bind(this));
};

module.exports = BrowserStackSessionManager;
