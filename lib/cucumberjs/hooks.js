module.exports = function () {

  var path           = require('path'),
      Promise        = require('bluebird'),
      SessionManager = require('../session-manager.js'),
      chaiAsPromised = require('chai-as-promised'),
      colors         = require('colors'),
      log            = require('../log'),
      fs             = require('fs-extra');

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

      global.sessionManager = new SessionManager({
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
        browser = require(configPath)(global.sessionManager, setBrowser);
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

        global.sessionManager.remote(webdriverOptions, setBrowser);
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
              log.debug('[chimp][hooks] saved screenshot to', ssPath);
              captureCallback();
            });
        });

        global.browser.timeoutsAsyncScript(parseInt(process.env['chimp.timeoutsAsyncScript']), function () {
          log.debug('[chimp][hooks] set timeoutsAsyncScript');
          callback();
        });

        if (process.env['chimp.browser'] === 'phantomjs') {
          global.browser.setViewportSize({
            width: process.env['chimp.phantom_w'] || 1280,
            height: process.env['chimp.phantom_h'] || 1024
          });
        }
      });

    });

    var setupDdp = function (callback) {
      log.debug('[chimp][hooks] setup DDP');
      if (process.env['chimp.ddp']) {
        log.debug('[chimp][hooks] connecting via DDP to', process.env['chimp.ddp']);
        return global.ddp.connect(function (error) {
          if (error) {
            log.error('[chimp][hooks] connecting via DDP error', error);
            callback(error);
          } else {
            log.error('[chimp][hooks] connecting via DDP had no error');
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
  var lastStep;
  this.StepResult(function (event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    lastStep = stepResult.getStep();
    if (process.env['chimp.screenshotsOnError'] !== 'false' && !stepResult.isSuccessful()) {
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

    var done = function () {
      log.debug('[chimp][hooks] Finished AfterFeatures');
      callback();
    };
    if (process.env['chimp.browser'] !== 'phantomjs') {
      log.debug('[chimp][hooks] Ending browser session');

      global.sessionManager.killCurrentSession(function () {
        log.debug('[chimp][hooks] Ended browser sessions');
        done();
      });

    } else {
      done();
    }

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
      }
    } catch (e) {
      log.debug('[chimp][hooks] Could not provide error hint');
    }

    log.debug('[chimp][hooks] Promise:', JSON.parse(JSON.stringify(promise)));
    log.debug('[chimp][hooks] Forcibly exiting Cucumber');

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
