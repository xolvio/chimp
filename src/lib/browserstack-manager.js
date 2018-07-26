var request = require('request'),
    log = require('./log'),
    _ = require('underscore');

/**
 * SessionManager Constructor
 *
 * @param {Object} options
 * @api public
 */
function BrowserStackSessionManager(options) {

  log.debug('[chimp][browserstack-session-manager] options are', options);

  var host = options.host.replace(/hub\.|hub-cloud\./, 'api.');
  var browserStackBaseUrl = 'https://' + options.user + ':' + options.key + '@' + host;
  options.browserStackUrl = browserStackBaseUrl;

  this.options = options;

  this.maxRetries = 30;
  this.retryDelay = 3000;
  this.retry = 0;

  // this will be set by the remote and multiremote methods from
  // desiredCapabilities
  this.buildName = null;

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

  this.buildName = webdriverOptions.desiredCapabilities.build;
  log.debug('[chimp][browserstack-session-manager] BuildName: ' + this.buildName);

  callback(null, browser);
  return;
};

/**
 * Wraps the webdriver multiremote method and allows reuse options
 *
 * @api public
 */
BrowserStackSessionManager.prototype.multiremote = function (webdriverOptions, callback) {
  log.debug('[chimp][browserstack-session-manager] creating webdriver remote ');
  var browser = this.webdriver.multiremote(webdriverOptions);
  this.buildName = webdriverOptions['browser0'].desiredCapabilities.build;
  log.debug('[chimp][browserstack-session-manager] BuildName: ' + this.buildName);
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
 * Kills all sessions in the matching running build found on
 * BrowserStack.
 *
 * If 'build' is specified in the desiredCapabilities, it will find a
 * running build with the specified build name, else it will consider
 * the first running build. When using multiremote, it's important to
 * to specify a unique 'build' in desiredCapabilities so that all and
 * only those sessions created by the current build are killed.
 *
 * @api public
 */
BrowserStackSessionManager.prototype.killCurrentSession = function (callback) {

  var self = this;
  var wdOptions = this.options;
  const wdHubSession = 'http://' + wdOptions.host + ':' + wdOptions.port + '/wd/hub/session';

  var killSession = function (session) {
    request.del(wdHubSession + '/' + session.automation_session.hashed_id, function (wdError, wdResponse) {
      if (!wdError && wdResponse.statusCode === 200) {
        var options = {
          url: wdOptions.browserStackUrl + '/automate/sessions/' + session.automation_session.hashed_id + '.json',
          method: 'PUT',
          json: true,
          body: {status: 'completed'}
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
      else {
        log.error('[chimp][browserstack-session-manager]', 'received error', wdError);
        callback(wdError);
      }
    });
  };

  var findBuild = function (builds) {
    if (self.buildName) {
      return _.find(builds, function (b) {
        return b.automation_build.name === self.buildName;
      });
    } else {
      return builds[0];
    }
  };

  this._getBuilds(function (err, builds) {
    if (builds && builds.length) {
      var build = findBuild(builds);
      log.debug('[chimp][browserstack-session-manager]', builds, build);
      var buildId = build.automation_build.hashed_id;
    }
    if (buildId !== '') {
      self._getSessions(buildId, function (err, sessions) {
        if (sessions && sessions.length) {
          sessions.forEach(killSession);
        }
      });
    }
  });
};

module.exports = BrowserStackSessionManager;
