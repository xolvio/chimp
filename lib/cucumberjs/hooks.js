module.exports = function () {

  var path           = require('path');
  var Promise        = require('bluebird');
  var SessionManager = require('../session-manager.js');
  var chaiAsPromised = require('chai-as-promised');
  var log            = require('../log');
  var fs             = require('fs-extra');
  var wrapAsync      = require('../fiber-utils').wrapAsync;
  var Fiber = require('fibers');

  var passed = true;

  this.registerHandler('BeforeFeatures', function (event) {

    log.debug('[chimp][hooks] Starting BeforeFeatures');

    global.wrapAsync = wrapAsync;

    var setupBrowser = function () {
      log.debug('[chimp][world] getting browser');
      var customChimpConfigPath = path.resolve(process.cwd(), process.env['chimp.path'], 'chimp.js');

      var _translateLogLevel = function () {
        if (process.env['chimp.log'] === 'info' ||
          process.env['chimp.log'] === 'warn' ||
          process.env['chimp.log'] === 'error') {
          return 'silent'
        }
        return process.env['chimp.log'];
      };

      global.sessionManager = new SessionManager({
        port: process.env['chimp.port'],
        browser: process.env['chimp.browser'],
        deviceName: process.env['chimp.deviceName']
      });

      if (fs.existsSync(customChimpConfigPath)) {
        var customChimpConfigurator = wrapAsync(require(customChimpConfigPath));
        global.browser = customChimpConfigurator(global.sessionManager);
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
          screenshotPath: process.env['chimp.screenshotPath'],
          sync: process.env['chimp.sync'] !== 'false'
        };
        log.debug('[chimp][world] webdriverOptions are ', JSON.stringify(webdriverOptions));

        var remoteSession = wrapAsync(global.sessionManager.remote, global.sessionManager);
        global.browser = remoteSession(webdriverOptions);
      }

      chaiAsPromised.transferPromiseness = global.browser.transferPromiseness;
    };

    var initBrowser = function () {
      log.debug('[chimp][hooks] init browser');
      var browser = global.browser;
      browser.init();
      log.debug('[chimp][hooks] init browser callback');

      browser.screenshotsCount = 0;
      browser.addCommand('capture', function (name) {
        var location = (browser.screenshotsCount++) + '-' + name + '_' + new Date().getTime() + '.png';
        fs.mkdirsSync(process.env['chimp.screenshotsPath']);
        var ssPath = path.join(process.env['chimp.screenshotsPath'], location);
        log.debug('[chimp][hooks] saving screenshot to', ssPath);
        this.saveScreenshot(ssPath, false);
        log.debug('[chimp][hooks] saved screenshot to', ssPath);
      });

      browser.timeoutsAsyncScript(parseInt(process.env['chimp.timeoutsAsyncScript']));
      log.debug('[chimp][hooks] set timeoutsAsyncScript');

      if (process.env['chimp.browser'] === 'phantomjs') {
        browser.setViewportSize({
          width: process.env['chimp.phantom_w'] || 1280,
          height: process.env['chimp.phantom_h'] || 1024
        });
      }
    };

    var setupDdp = function () {
      log.debug('[chimp][hooks] setup DDP');
      if (process.env['chimp.ddp']) {
        log.debug('[chimp][hooks] connecting via DDP to', process.env['chimp.ddp']);
        var ddpConnect = wrapAsync(global.ddp.connect, global.ddp);
        ddpConnect();
      } else {
        log.debug('[chimp][hooks] DDP not required');
      }
    };

    try {
      setupBrowser();
      initBrowser();
      setupDdp();
    } catch (error) {
      log.error('[chimp][hooks] BeforeFeatures hook had error');
      log.error(error);
      process.exit(2);
    }

    log.debug('[chimp][hooks] Finished BeforeFeatures');
    if (this.UserDefinedBeforeFeatures) {
      log.debug('[chimp][hooks] User-defined BeforeFeatures found, calling');
      // TODO: Wrap in the same thing as the Cucumber words (see cucumber-wrapper.js)
      global.UserDefinedBeforeFeatures.apply(this);
    } else {
      log.debug('[chimp][hooks] User-defined BeforeFeatures not found, finishing up');
    }
  });

  /**
   * Store browser test status so we can notify SauceLabs
   *
   * @param {Function} event
   */
  this.StepResult(function (event) {
    var stepResult = event.getPayloadItem('stepResult');
    if (process.env['chimp.screenshotsOnError'] !== 'false' && !stepResult.isSuccessful()) {
      log.debug('[chimp][hooks] step failed - capturing screenshot');
      global.browser.capture('step_failed');
    }
  });

  /**
   * After features have run we close the browser and optionally notify
   * SauceLabs
   *
   * @param {Function} event
   * @param {Function} callback
   */
  this.registerHandler('AfterFeatures', function (event) {
    log.debug('[chimp][hooks] Starting AfterFeatures');

    if (process.env['chimp.browser'] !== 'phantomjs') {
      log.debug('[chimp][hooks] Ending browser session');

      wrapAsync(global.sessionManager.killCurrentSession, global.sessionManager)();
      log.debug('[chimp][hooks] Ended browser sessions');
    }

    log.debug('[chimp][hooks] Finished AfterFeatures');
  });

  process.on('unhandledRejection', function (reason, promise) {
    log.error('[chimp] Detected an unhandledRejection.');
    log.error('[chimp] Did you forget to append a ".catch" to a promise that contains assertions?');
    log.error('[chimp][hooks]', reason);
    log.error('[chimp][hooks] Forcibly exiting Cucumber');
    process.send(JSON.stringify(reason));
    process.exit(2);
  });

  process.on('SIGINT', function () {
    log.debug('[chimp][hooks] Received SIGINT process event, ending browser session');
    global.browser.
      end().
      then(function () {
        log.debug('[chimp][hooks] ended browser session');
        process.exit();
      });
  });

};
