module.exports = function () {

  var path           = require('path'),
      SauceLabs      = require('saucelabs'),
      Promise        = require('bluebird'),
      SessionManager = require('../session-manager.js'),
      chaiAsPromised = require('chai-as-promised'),
      log            = require('../log'),
      fs             = require('fs-extra');

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

      var sessionManager = new SessionManager({
        port: process.env['chimp.port'],
        browser: process.env['chimp.browser'],
        deviceName: process.env['chimp.deviceName']
      });


      var setBrowser = function (err, res) {
        global.browser = res;
        chaiAsPromised.transferPromiseness = global.browser.transferPromiseness;
        callback(err, res)
      };

      if (fs.existsSync(configPath)) {
        // load monkey webdriver configuration
        browser = require(configPath)(sessionManager, setBrowser);

      } else {
        log.debug('[chimp][world] custom chimp.js not found, loading defaults');
        var webdriverOptions = {
          waitforTimeout: parseInt(process.env['chimp.waitForTimeout']),
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

        sessionManager.remote(webdriverOptions, setBrowser);
      }

    });

    var initBrowser = Promise.promisify(function (callback) {
      log.debug('[chimp][hooks] init browser');
      global.browser.init(function () {

        log.debug('[chimp][hooks] init browser callback');

        global.browser.screenshotsCount = 0;
        global.browser.addCommand('capture', function (name, captureCallback) {
          var location = (global.browser.screenshotsCount++) + '-' + name + '_' + new Date().getTime() + '.png';
          fs.mkdirsSync(process.env['chimp.screenshotsPath']);
          var ssPath = path.join(process.env['chimp.screenshotsPath'], location);
          log.debug('[chimp][hooks] saving screenshot to', ssPath);
          return this.saveScreenshot(ssPath, false,
            function () {
              log.debug('[chimp][hooks] saved screenshot to', location);
              captureCallback();
            });
        });

        if (process.env['chimp.browser'] === 'phantomjs') {
          global.browser.setViewportSize({
            width: process.env['chimp.phantom_w'] || 1280,
            height: process.env['chimp.phantom_h'] || 1024
          });
        }
      }).timeoutsAsyncScript(parseInt(process.env['chimp.timeoutsAsyncScript']), function() {
        log.debug('[chimp][hooks] set timeoutsAsyncScript');
        callback();
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
        Promise.promisify(function () {});
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
        if (this.UserDefinedBeforeFeatures) {
          log.debug('[chimp][hooks] User-defined BeforeFeatures found, calling');
          global.UserDefinedBeforeFeatures.apply(this, [function () {
            callback();
          }]);
        } else {
          log.debug('[chimp][hooks] User-defined BeforeFeatures not found, finishing up');
          callback();
        }
      },
      function (error) {
        log.error('[chimp][hooks] BeforeFeatures hook had error');
        log.error(error);
        process.exit(2);
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
    if (process.env['chimp.screenshotsOnError'] && !stepResult.isSuccessful()) {
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

    log.debug('[chimp][hooks] Ending browser session');

    var done = function () {
      log.debug('[chimp][hooks] Finished AfterFeatures');
      callback();
    };
    if (process.env['chimp.browser'] !== 'phantomjs') {
      global.browser
        .end()
        .then(done);
    } else {
      done();
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
