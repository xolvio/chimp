module.exports = function () {

  var path = require('path');
  var Promise = require('bluebird');
  var SessionManager = require('../session-manager.js');
  var chaiAsPromised = require('chai-as-promised');
  var colors = require('colors');
  var log = require('../log');
  var fs = require('fs-extra');
  var exit = require('exit');
  var _ = require('underscore');
  var screenshots = {};

  var wrapAsyncForWebdriver = function (fn, context) {
    return wrapAsync(fn, context, {supportCallback: false});
  };

  this.registerHandler('BeforeFeatures', function (event) {

    log.debug('[chimp][hooks] Starting BeforeFeatures');

    var setupBrowser = function () {
      log.debug('[chimp][hooks] getting browser');
      var customChimpConfigPath = path.resolve(process.cwd(), process.env['chimp.path'], 'chimp.js');

      var _translateLogLevel = function () {
        if (process.env['chimp.webdriverLogLevel']) {
          return process.env['chimp.webdriverLogLevel'];
        } else if (process.env['chimp.log'] === 'info' ||
          process.env['chimp.log'] === 'warn' ||
          process.env['chimp.log'] === 'error') {
          return 'silent'
        } else {
          return process.env['chimp.log'];
        }
      };

      console.log("chimp.multibrowser ", process.env['CUCUMBER_MULTIBROWSER']);
      global.sessionManager = new SessionManager({
        port: process.env['chimp.port'],
        browser: process.env['chimp.browser'],
        deviceName: process.env['chimp.deviceName']
      });

      if (fs.existsSync(customChimpConfigPath)) {
        var customChimpConfigurator = wrapAsync(require(customChimpConfigPath));
        global.browser = customChimpConfigurator(global.sessionManager);
      } else {
        log.debug('[chimp][hooks] custom chimp.js not found, loading defaults');
        var webdriverOptions = {};
        var options = {
          waitforTimeout: parseInt(process.env['chimp.waitForTimeout']),
          user: process.env['chimp.user'] || process.env.SAUCE_USERNAME,
          key: process.env['chimp.key'] || process.env.SAUCE_ACCESS_KEY,
          host: process.env['chimp.host'],
          port: process.env['chimp.port'],
          logLevel: _translateLogLevel(),
          screenshotPath: process.env['chimp.screenshotPath'],
          sync: process.env['chimp.sync'] !== 'false',
          multiBrowser: false
        };

        if (process.env['chimp.baseUrl']) {
          options.baseUrl = process.env['chimp.baseUrl']
        }

        var desiredCapabilities = {
          browserName: process.env['chimp.browser'],
              platform: process.env['chimp.platform'],
              name: process.env['chimp.name']
        };

        desiredCapabilities.chromeOptions = desiredCapabilities.chromeOptions || {};
        if (process.env['chimp.chromeBin']) {
          desiredCapabilities.chromeOptions.binary = process.env['chimp.chromeBin'];
        }
        if (process.env['chimp.chromeArgs']) {
          desiredCapabilities.chromeOptions.args = process.env['chimp.chromeArgs'].split(',');
        } else if (process.env['chimp.chromeNoSandbox']) {
          desiredCapabilities.chromeOptions.args = ['no-sandbox'];
        }

        if (process.env['chimp.watch']) {
          desiredCapabilities.applicationCacheEnabled = false;
        }


        if (process.env['CUCUMBER_BROWSERS']) {
          options.multiBrowser = true;
          var _browsersTotal = 2;
          for (var _browserIndex = 0; _browserIndex < _browsersTotal; _browserIndex++) {
            webdriverOptions['browser' + _browserIndex] = _.clone(options);
            webdriverOptions['browser' + _browserIndex].desiredCapabilities = desiredCapabilities
          }
        } else {
          options.desiredCapabilities = desiredCapabilities;
          webdriverOptions = options;
        }

        console.log('[chimp][hooks] options are ', JSON.stringify(webdriverOptions));
        log.debug('[chimp][hooks] webdriverOptions are ', JSON.stringify(webdriverOptions));

        var remoteSession = wrapAsync(global.sessionManager.remote, global.sessionManager);

        global.browser = remoteSession(webdriverOptions);
      }

      chaiAsPromised.transferPromiseness = global.browser.transferPromiseness;
    };

    function initSingleBrowser(singleBrowser) {
      singleBrowser.screenshotsCount = 0;
      singleBrowser.addCommand('capture', function(name) {
        name = name.replace(/[ \\~#%&*{}/:<>?|"-]/g, '_');
        var location = (singleBrowser.screenshotsCount++) + '_' + name + '.png';
        fs.mkdirsSync(process.env['chimp.screenshotsPath']);
        var ssPath = path.join(process.env['chimp.screenshotsPath'], location);
        log.debug('[chimp][hooks] saving screenshot to', ssPath);
        this.saveScreenshot(ssPath, false);
        log.debug('[chimp][hooks] saved screenshot to', ssPath);
      });

      singleBrowser.timeoutsAsyncScriptSync(parseInt(process.env['chimp.timeoutsAsyncScript']));
      log.debug('[chimp][hooks] set timeoutsAsyncScript');

      if (process.env['chimp.browser'] === 'phantomjs') {
        singleBrowser.setViewportSizeSync({
          width: process.env['chimp.phantom_w'] || 1280,
          height: process.env['chimp.phantom_h'] || 1024
        });
      }
    }

    var initBrowser = function () {
      log.debug('[chimp][hooks] init browser');
      var browser = global.browser;
      browser.initSync();
      log.debug('[chimp][hooks] init browser callback');
      if (browser.browsers) {
        browser.browsers.forEach(function(singleBrowser) {
          initSingleBrowser(singleBrowser)
        });
      }
      else {
        initSingleBrowser(browser);
      }

    };

    var setupDdp = function () {
      log.debug('[chimp][hooks] setup DDP');
      if (process.env['chimp.ddp']) {
        log.debug('[chimp][hooks] connecting via DDP to', process.env['chimp.ddp']);
        try {
          global.ddp.connectSync();
          log.debug('[chimp][hooks] connecting via DDP had no error');
        } catch (error) {
          log.error('[chimp][hooks] connecting via DDP error', error);
        }
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
      log.error(error.stack);
      exit(2);
      return;
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
  var lastStep;
  this.StepResult(function (event) {
    var stepResult = event.getPayloadItem('stepResult');
    lastStep = stepResult.getStep();

    if (process.env['chimp.captureAllStepScreenshots'] ||
      (!stepResult.isSuccessful() && process.env['chimp.screenshotsOnError'] !== 'false')
    ) {
      log.debug('[chimp][hooks] capturing screenshot');

      var screenshotId = lastStep.getUri() + ':' + lastStep.getLine();
      screenshots[screenshotId] = {
        keyword: lastStep.getKeyword(),
        name: lastStep.getName(),
        uri: lastStep.getUri(),
        line: lastStep.getLine(),
        png: browser.screenshot().value
      };

      if (process.env['chimp.saveScreenshots'] !== 'false') {
        var affix = !stepResult.isSuccessful() ? ' (failed)' : '';
        browser.captureSync(lastStep.getKeyword() + ' ' + lastStep.getName() + affix);
      }

    }
  });

  this.After(function (scenario) {
    log.debug('[chimp][hooks] attaching failed step screenshot to report');
    for (var i in screenshots) {
      var decodedImage = new Buffer(screenshots[i].png, 'base64').toString('binary');
      scenario.attach(decodedImage, 'image/png');
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
    log.error('[chimp] Detected an unhandledRejection.'.red);

    try {
      if (reason.type === 'CommandError' && reason.message === 'Promise never resolved with an truthy value') {
        reason.type += 'WebdriverIO CommandError (Promise never resolved with an truthy value)';
        reason.message = 'This usually happens when WebdriverIO assertions fail or timeout.';
        var hint = 'HINT: Check the step AFTER [' + lastStep.getKeyword() + lastStep.getName() + ']';
        var uri = lastStep.getUri();
        uri = uri.substring(process.cwd().length, uri.length);
        hint += ' (' + uri + ': >' + lastStep.getLine() + ')';
        log.error('[chimp][hooks] Reason:'.red);
        log.error('[chimp][hooks]'.red, reason.type.red);
        log.error('[chimp][hooks]'.red, reason.message.red);
        log.error(hint.yellow);
        reason.message += '\n' + hint;
      } else {
        log.error('[chimp][hooks] Reason:'.red);
        log.error('[chimp][hooks]'.red, reason.type.red);
        log.error('[chimp][hooks]'.red, reason.message.red);
      }
    } catch (e) {
      log.debug('[chimp][hooks] Could not provide error hint');
    }

    log.debug('[chimp][hooks] Promise:', JSON.parse(JSON.stringify(promise)));
    log.debug('[chimp][hooks] Forcibly exiting Cucumber');

    process.send(JSON.stringify(reason));
    // Don't exit until the waitUntil uncaught promise bug is fixed in WebdriverIO
    //exit(2);
  });

  process.on('SIGINT', function () {
    log.debug('[chimp][hooks] Received SIGINT process event, ending browser session');
    global.browser.
      endAsync().
      then(function () {
        log.debug('[chimp][hooks] ended browser session');
        exit();
      });
  });

};
