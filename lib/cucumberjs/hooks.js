module.exports = function () {

  var path = require('path'),
      SauceLabs = require('saucelabs'),
      Promise = require('bluebird'),
      SessionManager = require('../session-manager.js'),
      chaiAsPromised = require('chai-as-promised'),
      log = require('../log'),
      fs = require('fs-extra');

  var passed = true;

  this.registerHandler('BeforeFeatures', function (event, callback) {

    log.debug('[chimp][hooks] Starting BeforeFeatures');


    var setupBrowser = Promise.promisify(function (callback) {


      log.debug('[chimp][world] getting browser');
      var configPath = path.resolve(process.cwd(), process.env['chimp.path'], 'chimp.js');

      var _translateLogLevel = function () {
        if (process.env['chimp.log'] === 'info' ||
          process.env['chimp.log'] === 'warn' ||
          process.env['chimp.log'] === 'error') {
          return 'silent'
        }
        return process.env['chimp.log'];
      };


      var browser;
      if (fs.existsSync(configPath)) {
        // load monkey webdriver configuration
        browser = require(configPath)(this);
        process.nextTick(function () {
          global.browser = browser;
          callback(null, browser);
        });
      } else {
        log.debug('[chimp][world] no configPath found');
        var webdriverOptions = {
          desiredCapabilities: {
            browserName: process.env['chimp.browser'],
            platform: process.env['chimp.platform'],
            name: process.env['chimp.name']
          },
          user: process.env['chimp.user'] || process.env.SAUCE_USERNAME,
          key: process.env['chimp.key'] || process.env.SAUCE_ACCESS_KEY,
          host: process.env['chimp.host'],
          port: process.env['chimp.port'],
          logLevel: _translateLogLevel(),
          screenshotPath: process.env['chimp.screenshotPath']
        };
        log.debug('[chimp][world] webdriverOptions are ', JSON.stringify(webdriverOptions));
        var sessionManager = new SessionManager({
          port: process.env['chimp.port'],
          browser: process.env['chimp.browser']
        });

        sessionManager.remote(webdriverOptions, function (err, res) {
          global.browser = res;
          chaiAsPromised.transferPromiseness = global.browser.transferPromiseness;
          callback(err, res)
        });
      }

    });



    var initBrowser = Promise.promisify(function (callback) {
      log.debug('[chimp][hooks] init browser');
      global.browser.init(function () {

        log.debug('[chimp][hooks] init browser callback');

        global.browser.timeoutsAsyncScript(parseInt(process.env['chimp.timeoutsAsyncScript']));

        // helper method for sending test results to SauceLabs
        global.browser.addCommand('sauceJobStatus', function (status, done) {
          var sauceAccount = new SauceLabs({
            username: process.env['chimp.user'] || process.env.SAUCE_USERNAME,
            password: process.env['chimp.key'] || process.env.SAUCE_ACCESS_KEY
          });
          sauceAccount.updateJob(global.browser.requestHandler.sessionID, status, done);
        });

        global.browser.screenshotsCount = 0;
        global.browser.addCommand('capture', function (name, callback) {
          var location = (global.browser.screenshotsCount++) + '-' + name + '_' + new Date().getTime() + '.png';
          fs.mkdirsSync(process.env['chimp.screenshotsPath']);
          var ssPath = path.join(process.env['chimp.screenshotsPath'], location);
          log.debug('[chimp][hooks] saving screenshot to', ssPath);
          return this.saveScreenshot(ssPath, false,
            function () {
              log.debug('[chimp][hooks] saved screenshot to', location);
              callback();
            });
        });

        process.on('uncaughtException', function () {
          log.debug('[chimp][hooks] process uncaughtException event - capturing screenshot');
          global.browser.capture('process_uncaughtException');
        });

        browser.on('error', function (event) {
          if (event.err && (event.err.code === 'ECONNREFUSED' || event.err.code === 'ECONNRESET')) {
            log.error('[chimp][hooks] browser error - remote connection refused. webdriver sever down?');
            process.exit();
          }
          log.error('[chimp][hooks] browser error event - capturing screenshot');
          global.browser.capture('browser_error');

          log.debug('[chimp][hooks] trying to handle browser error', event);
          if (event.body && event.body.value && event.body.value.message) {
            var toThrow;
            try {
              toThrow = JSON.parse(event.body.value.message).errorMessage;
            } catch (e) {
              toThrow = event;
            }
          } else {
            toThrow = event;
          }
          log.error('[chimp][hooks] browser error', toThrow);
          throw toThrow;
        });

        if (process.env['chimp.browser'] === 'phantomjs') {
          global.browser.setViewportSize({
            width: process.env['chimp.phantom_w'] || 1280,
            height: process.env['chimp.phantom_h'] || 1024
          }, callback);
        } else {
          callback();
        }

      });
    });

    var setupDdp = function (callback) {
      log.debug('[chimp][hooks] setup DDP');
      if (process.env['chimp.ddp']) {
        log.debug('[chimp][hooks] connecting via DDP to', process.env['chimp.ddp']);
        return global.ddp.connect(function (error) {
          if (error) {
            callback(error);
          } else {
            callback();
          }
        });
      } else {
        log.debug('[chimp][hooks] DDP not required');
        // worthless http://en.wiktionary.org/wiki/empty_promise
        Promise.promisify(function(){});
      }
    };

    setupBrowser().then(function () {
      return Promise.all([
        initBrowser(),
        setupDdp()
      ])
    }).then(
      function () {
        log.debug('[chimp][hooks] Finished BeforeFeatures');
        if (this.AfterBeforeFeatures) {
          log.debug('[chimp][hooks] AfterBeforeFeatures found, calling');
          this.AfterBeforeFeatures.apply(this, [callback]);
        } else {
          log.debug('[chimp][hooks] AfterBeforeFeatures not found, finishing up');
          callback();
        }
      },
      function (error) {
        log.error('[chimp][hooks] Finished BeforeFeatures with error', error);
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
      log.debug('[chimp][hooks] step failed - capturing screenshot');
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
    log.debug('[chimp][hooks] Starting AfterFeatures');
    if (process.env['chimp.host'].toString().match(/saucelabs/)) {
      if (global.browser.sauceJobStatus) {
        global.browser.sauceJobStatus(
          {
            passed: passed,
            public: true
          }
        ).endAll().then(function () {
            log.debug('[chimp][hooks] Finished AfterFeatures');
            callback();
          });
      }
    } else {
      log.debug('[chimp][hooks] Ending browser session');
      global.browser
        .end()
        .then(function () {
          log.debug('[chimp][hooks] Finished AfterFeatures');
          callback();
        });
    }
  });

  process.on('SIGINT', function () {
    log.debug('[chimp][hooks] Received SIGINT process event, ending browser session');
    global.browser.
      end().
      then(function () {
        process.exit();
      });
  });

};
