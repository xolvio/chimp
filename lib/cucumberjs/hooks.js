module.exports = function () {

  var fs = require('fs'),
      path = require('path'),
      SauceLabs = require('saucelabs'),
      Promise = require('bluebird'),
      log = require('../log');

  var passed = true;

  this.registerHandler('BeforeFeatures', function (event, callback) {

    log.debug('[cuke-monkey][hooks] Starting BeforeFeatures');
    var initBrowser = Promise.promisify(function (callback) {
      log.debug('[cuke-monkey][hooks] init browser');
      global.browser.init(function () {

        log.debug('[cuke-monkey][hooks] init browser callback');

        global.browser.timeoutsAsyncScript(parseInt(process.env['monkey.timeoutsAsyncScript']));

        // helper method for sending test results to SauceLabs
        global.browser.addCommand('sauceJobStatus', function (status, done) {
          var sauceAccount = new SauceLabs({
            username: process.env['monkey.user'] || process.env.SAUCE_USERNAME,
            password: process.env['monkey.key'] || process.env.SAUCE_ACCESS_KEY
          });
          sauceAccount.updateJob(global.browser.requestHandler.sessionID, status, done);
        });

        global.browser.screenshotsCount = 0;
        global.browser.addCommand('capture', function (name, callback) {
          var location = (global.browser.screenshotsCount++) + '-' + name + '_' + new Date().getTime() + '.png';
          var ssPath = path.join(process.env['monkey.screenshotsPath'], location);
          log.debug('[cuke-monkey][hooks] saving screenshot to', ssPath);
          return this.saveScreenshot(ssPath, false,
            function() {
              log.debug('[cuke-monkey][hooks] saved screenshot to', location);
              callback();
            });
        });

        process.on('uncaughtException', function () {
          log.debug('[cuke-monkey][hooks] process uncaughtException event - capturing screenshot');
          global.browser.capture('process_uncaughtException');
        });

        browser.on('error', function (event) {
          if (event.err && (event.err.code === 'ECONNREFUSED' || event.err.code === 'ECONNRESET')) {
            log.error('[cuke-monkey][hooks] browser error - remote connection refused. webdriver sever down?');
            process.exit();
          }
          log.error('[cuke-monkey][hooks] browser error event - capturing screenshot');
          global.browser.capture('browser_error');
        });

        if (process.env['monkey.browser'] === 'phantomjs') {
          global.browser.setViewportSize({
            width: process.env['monkey.phantom_w'] || 1280,
            height: process.env['monkey.phantom_h'] || 1024
          }, callback);
        } else {
          callback();
        }

      });
    });

    var setupDdp = Promise.promisify(function (callback) {
      log.debug('[cuke-monkey][hooks] setup DDP');
      if (process.env['monkey.ddp']) {
        _monkeyPatchDDPCall();

        Promise.promisifyAll(global.ddp);

        global.ddp.connect(function (error) {
          if (error) {
            callback(error);
          } else {
            callback();
          }
        });
      } else {
        callback()
      }
    });

    Promise.all([
      initBrowser(),
      setupDdp()
    ]).then(
      function () {
        log.debug('[cuke-monkey][hooks] Finished BeforeFeatures');
        callback();
      },
      function (error) {
        log.error('[cuke-monkey][hooks] Finished BeforeFeatures with error', error);
        callback(error);
      }
    )
  });

  /**
   * Store browser test status so we can notify SauceLabs
   *
   * @param {Function} event
   * @param {Function} callback
   */
  this.StepResult(function (event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    passed = stepResult.isSuccessful() && passed;
    if (!passed) {
      log.debug('[cuke-monkey][hooks] step failed - capturing screenshot');
      global.browser.capture('step_failed', callback);
    } else {
      callback();
    }

  });

  /**
   * After features have run we close the browser and optionally notify
   * SauceLabs
   *
   * @param {Function} event
   * @param {Function} callback
   */
  this.registerHandler('AfterFeatures', function (event, callback) {
    log.debug('[cuke-monkey][hooks] Starting AfterFeatures');
    if (process.env['monkey.host'].toString().match(/saucelabs/)) {
      if (global.browser.sauceJobStatus) {
        global.browser.sauceJobStatus(
          {
            passed: passed,
            public: true
          }
        ).endAll().then(function () {
            log.debug('[cuke-monkey][hooks] Finished AfterFeatures');
            callback();
          });
      }
    } else {
      log.debug('[cuke-monkey][hooks] Ending browser session');
      global.browser
        .end()
        .then(function () {
          log.debug('[cuke-monkey][hooks] Finished AfterFeatures');
          callback();
        });
    }
  });

  process.on('SIGINT', function () {
    log.debug('[cuke-monkey][hooks] Received SIGINT process event, ending browser session');
    global.browser.
      end().
      then(function () {
        process.exit();
      });
  });

  function _monkeyPatchDDPCall () {
    var _ddpCall = global.ddp.call;
    global.ddp.call = function () {
      var args = Array.prototype.splice.call(arguments, 0);
      var originalCallback = args.pop();
      var wrappedCallback = function (err, res) {
        // check if this callback is a cucumber callback
        if (typeof originalCallback.fail === 'function') {
          if (err) {
            originalCallback.fail('DDP error: ' + err.message);
          } else {
            originalCallback();
          }
        } else {
          originalCallback.apply(this, arguments);
        }
      };
      args.push(wrappedCallback);
      _ddpCall.apply(this, args);
    };
  }

};
