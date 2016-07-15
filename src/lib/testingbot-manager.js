var request = require('request'),
  log = require('./log');

/**
 * SessionManager Constructor
 *
 * @param {Object} options
 * @api public
 */
function TestingBotSessionManager(options) {

  log.debug('[chimp][testingbot-session-manager] options are', options);

  var testingbotBaseUrl = 'https://' + options.user + ':' + options.key + '@api.testingbot.com/v1/';
  options.testingbotBaseUrl = testingbotBaseUrl;

  this.options = options;

  this.maxRetries = 30;
  this.retryDelay = 3000;
  this.retry = 0;

  log.debug('[chimp][testingbot-session-manager] created a new SessionManager', options);

}

TestingBotSessionManager.prototype.webdriver = require('xolvio-sync-webdriverio');

/**
 * Wraps the webdriver remote method and allows reuse options
 *
 * @api public
 */
TestingBotSessionManager.prototype.remote = function (webdriverOptions, callback) {

  var self = this;

  log.debug('[chimp][testingbot-session-manager] creating webdriver remote ');
  var browser = this.webdriver.remote(webdriverOptions);

  callback(null, browser);
  return;
};

/**
 * Gets a list of sessions from the TestingBot API based on Build ID
 *
 * @api private
 */
TestingBotSessionManager.prototype._getJobs = function (callback) {
  var hub = this.options.testingbotBaseUrl + '/tests?count=10'; //default is 100 which seems like too much

  log.debug('[chimp][testingbot-session-manager]', 'requesting sessions from', hub);

  request(hub, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      log.debug('[chimp][testingbot-session-manager]', 'received data', body);
      callback(null, JSON.parse(body));
    } else {
      log.error('[chimp][testingbot-session-manager]', 'received error', error);
      callback(error);
    }
  });
};

/**
 * Kills the 1st session found running on TestingBot
 *
 * @api public
 */
TestingBotSessionManager.prototype.killCurrentSession = function (callback) {

  this._getJobs(function (err, jobs) {
    if (jobs && jobs.length) {
      var job = jobs[0];

      // This will stop the session, causing a 'User terminated' error.
      // If we don't manually stop the session, we get a timed-out error.
      var options = {
        url: this.options.testingbotBaseUrl + '/tests/' + job.id + '/stop',
        method: 'PUT'
      };

      request(options, function (error, response) {
        if (!error && response.statusCode === 200) {
          log.debug('[chimp][testingbot-session-manager]', 'stopped session');
          callback();
        } else {
          log.error('[chimp][testingbot-session-manager]', 'received error', error);
          callback(error);
        }
      });

      // This will set the session to passing or else it will show as Errored out
      // even though we stop it.
      options = {
        url: this.options.testingbotBaseUrl + '/tests/' + job.id,
        method: 'PUT',
        json: true,
        body: { 'test[passed]': true }
      };

      request(options, function (error, response) {
        if (!error && response.statusCode === 200) {
          log.debug('[chimp][testingbot-session-manager]', 'updated session to passing state');
          callback();
        } else {
          log.error('[chimp][testingbot-session-manager]', 'received error', error);
          callback(error);
        }
      });
    }
  }.bind(this));
};

module.exports = TestingBotSessionManager;
