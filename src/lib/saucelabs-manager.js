var request = require('request'),
  log = require('./log');

/**
 * SessionManager Constructor
 *
 * @param {Object} options
 * @api public
 */
function SauceLabsSessionManager(options) {

  log.debug('[chimp][saucelabs-session-manager] options are', options);

  var host = options.host.replace('ondemand.', '');
  var sauceLabsBaseUrl = 'https://' + options.user + ':' + options.key + '@' + host + '/rest/v1/' + options.user;
  options.sauceLabsUrl = sauceLabsBaseUrl;

  this.options = options;

  this.maxRetries = 30;
  this.retryDelay = 3000;
  this.retry = 0;

  log.debug('[chimp][saucelabs-session-manager] created a new SessionManager', options);

}

SauceLabsSessionManager.prototype.webdriver = require('xolvio-sync-webdriverio');

/**
 * Wraps the webdriver remote method and allows reuse options
 *
 * @api public
 */
SauceLabsSessionManager.prototype.remote = function (webdriverOptions, callback) {

  var self = this;

  log.debug('[chimp][saucelabs-session-manager] creating webdriver remote ');
  var browser = this.webdriver.remote(webdriverOptions);

  callback(null, browser);
  return;
};

/**
 * Gets a list of sessions from the SauceLabs API based on Build ID
 *
 * @api private
 */
SauceLabsSessionManager.prototype._getJobs = function (callback) {
  var hub = this.options.sauceLabsUrl + '/jobs?full=:get_full_info&limit=10'; //default is 100 which seems like too much

  log.debug('[chimp][saucelabs-session-manager]', 'requesting sessions from', hub);

  request(hub, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      log.debug('[chimp][saucelabs-session-manager]', 'received data', body);
      callback(null, JSON.parse(body));
    } else {
      log.error('[chimp][saucelabs-session-manager]', 'received error', error);
      callback(error);
    }
  });
};

/**
 * Kills the 1st session found running on SauceLabs
 *
 * @api public
 */
SauceLabsSessionManager.prototype.killCurrentSession = function (callback) {

  this._getJobs(function (err, jobs) {
    if (jobs && jobs.length) {
      var job = jobs[0];

      // This will stop the session, causing a 'User terminated' error.
      // If we don't manually stop the session, we get a timed-out error.
      var options = {
        url: this.options.sauceLabsUrl + '/jobs/' + job.id + '/stop',
        method: 'PUT'
      };

      request(options, function (error, response) {
        if (!error && response.statusCode === 200) {
          log.debug('[chimp][saucelabs-session-manager]', 'stopped session');
          callback();
        } else {
          log.error('[chimp][saucelabs-session-manager]', 'received error', error);
          callback(error);
        }
      });

      // This will set the session to passing or else it will show as Errored out
      // even though we stop it.
      options = {
        url: this.options.sauceLabsUrl + '/jobs/' + job.id,
        method: 'PUT',
        json: true,
        body: { passed: true }
      };

      request(options, function (error, response) {
        if (!error && response.statusCode === 200) {
          log.debug('[chimp][saucelabs-session-manager]', 'updated session to passing state');
          callback();
        } else {
          log.error('[chimp][saucelabs-session-manager]', 'received error', error);
          callback(error);
        }
      });
    }
  }.bind(this));
};

module.exports = SauceLabsSessionManager;
