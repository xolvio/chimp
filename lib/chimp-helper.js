var chai            = require('chai'),
    chaiAsPromised  = require('chai-as-promised'),
    log             = require('./log'),
    DDP             = require('./ddp'),
    request         = require('request'),
    Promise         = require('bluebird'),
    _               = require('underscore'),
    wrapAsync       = require('xolvio-sync-webdriverio').wrapAsync,
    wrapAsyncObject = require('xolvio-sync-webdriverio').wrapAsyncObject,
    SessionFactory  = require('./session-factory'),
    widgets         = require('chimp-widgets'),
    path            = require('path'),
    colors          = require('colors'),
    fs              = require('fs-extra'),
    exit            = require('exit');

var chimpHelper = {
  loadAssertionLibrary: function () {
    if (process.env['chimp.chai']) {
      log.debug('[chimp][helper] Using the chai-expect assertion library');
      chai.use(chaiAsPromised);
      chai.should();
      // give users access to the chai instance
      global.chai = chai;
      global.expect = chai.expect;
      global.assert = chai.assert;
    } else {
      log.debug('[chimp][helper] Using the jasmine-expect assertion library');
      global.expect = require('xolvio-jasmine-expect').expect;
    }
  },

  setupGlobals: function () {
    global.wrapAsync = wrapAsync;
    global.wrapAsyncObject = wrapAsyncObject;

    // give users access the request module
    global.request = request;
    _.extend(global, wrapAsyncObject(global, ['request'], {
      syncByDefault: process.env['chimp.sync'] !== 'false'
    }));

    // Give the user access to Promise functions. E.g. Promise.all.
    global.Promise = Promise;

    if (process.env['chimp.ddp']) {
      global.ddp = new DDP().connect();
    }
  },

  configureWidgets: function () {
    // CHIMP WIDGETS
    global.chimpWidgets = widgets;
  },

  createGlobalAliases: function () {
    global.driver = global.browser;
    global.client = global.browser;
    global.mirror = global.ddp;
    global.server = global.ddp;
  },

  setupBrowserAndDDP: function () {

    var self = this;

    var setupBrowser = function () {
      log.debug('[chimp][helper] getting browser');
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

      global.sessionManager = new SessionFactory({
        host: process.env['chimp.host'],
        port: process.env['chimp.port'],
        user: process.env['chimp.user'],
        key: process.env['chimp.key'],
        browser: process.env['chimp.browser'],
        deviceName: process.env['chimp.deviceName']
      });

      if (fs.existsSync(customChimpConfigPath)) {
        var customChimpConfigurator = wrapAsync(require(customChimpConfigPath));
        global.browser = customChimpConfigurator(global.sessionManager);
      } else {
        log.debug('[chimp][helper] custom chimp.js not found, loading defaults');
        var webdriverOptions = {
          waitforTimeout: parseInt(process.env['chimp.waitForTimeout']),
          timeoutsImplicitWait: parseInt(process.env['chimp.timeoutsImplicitWait']),
          desiredCapabilities: {
            browserName: process.env['chimp.browser'],
            platform: process.env['chimp.platform'],
            name: process.env['chimp.name'],
            version: process.env['chimp.version']
          },
          user: process.env['chimp.user'] || process.env.SAUCE_USERNAME,
          key: process.env['chimp.key'] || process.env.SAUCE_ACCESS_KEY,
          host: process.env['chimp.host'],
          port: process.env['chimp.port'],
          logLevel: _translateLogLevel(),
          screenshotPath: process.env['chimp.screenshotPath'],
          sync: process.env['chimp.sync'] !== 'false'
        };

        webdriverOptions.desiredCapabilities.chromeOptions = webdriverOptions.desiredCapabilities.chromeOptions || {};
        if (process.env['chimp.chromeBin']) {
          webdriverOptions.desiredCapabilities.chromeOptions.binary = process.env['chimp.chromeBin'];
        }
        if (process.env['chimp.chromeArgs']) {
          webdriverOptions.desiredCapabilities.chromeOptions.args = process.env['chimp.chromeArgs'].split(',');
        } else if (process.env['chimp.chromeNoSandbox']) {
          webdriverOptions.desiredCapabilities.chromeOptions.args = ['no-sandbox'];
        }

        if (process.env['chimp.baseUrl']) {
          webdriverOptions.baseUrl = process.env['chimp.baseUrl']
        }
        if (process.env['chimp.watch']) {
          webdriverOptions.desiredCapabilities.applicationCacheEnabled = false;
        }
        if(process.env['chimp.tunnelIdentifier']) {
          webdriverOptions.desiredCapabilities.tunnelIdentifier = process.env['chimp.tunnelIdentifier'];
          }
        if (process.env['chimp.browserstackLocal']) {
          webdriverOptions.desiredCapabilities['browserstack.local'] = process.env['chimp.browserstackLocal'];
        }
        log.debug('[chimp][helper] webdriverOptions are ', JSON.stringify(webdriverOptions));

        var remoteSession = wrapAsync(global.sessionManager.remote, global.sessionManager);
        global.browser = remoteSession(webdriverOptions);
      }

      chaiAsPromised.transferPromiseness = global.browser.transferPromiseness;
    };

    var initBrowser = function () {
      log.debug('[chimp][helper] init browser');
      var browser = global.browser;
      browser.initSync();
      log.debug('[chimp][helper] init browser callback');

      browser.screenshotsCount = 0;
      browser.addCommand('capture', function (name) {
        name = name.replace(/[ \\~#%&*{}/:<>?|"-]/g, '_');
        var location = (browser.screenshotsCount++) + '_' + name + '.png';
        fs.mkdirsSync(process.env['chimp.screenshotsPath']);
        var ssPath = path.join(process.env['chimp.screenshotsPath'], location);
        log.debug('[chimp][helper] saving screenshot to', ssPath);
        this.saveScreenshot(ssPath, false);
        log.debug('[chimp][helper] saved screenshot to', ssPath);
      });

      browser.timeoutsAsyncScriptSync(parseInt(process.env['chimp.timeoutsAsyncScript']));
      log.debug('[chimp][helper] set timeoutsAsyncScript');

      if (process.env['chimp.browser'] === 'phantomjs') {
        browser.setViewportSizeSync({
          width: process.env['chimp.phantom_w'] || 1280,
          height: process.env['chimp.phantom_h'] || 1024
        });
      }
    };

    var addServerExecute = function () {
      global.ddp.execute = function (func) {
        var args = Array.prototype.slice.call(arguments, 1);
        var result;
        try {
          result = server.call('xolvio/backdoor', func.toString(), args);
        } catch (exception) {
          if (exception.error === 404) {
            throw new Error('[chimp] You need to install xolvio:backdoor in your meteor app before you can use server.execute()');

          } else {
            throw exception;
          }
        }
        if (result.error) {
          var error = new Error('Error in server.execute' + result.error.message);
          error.stack += '\n' + result.error.stack.replace(/ {4}at/g, '  @');
          throw error;
        } else {
          return result.value;
        }
      };
    };

    var setupDdp = function () {
      log.debug('[chimp][helper] setup DDP');
      if (process.env['chimp.ddp']) {
        log.debug('[chimp][helper] connecting via DDP to', process.env['chimp.ddp']);
        try {
          global.ddp.connectSync();
          addServerExecute();
          log.debug('[chimp][helper] connecting via DDP had no error');
        } catch (error) {
          log.error('[chimp][helper] connecting via DDP error', error);
        }
      } else {
        var noDdp = function () {
          expect('DDP Not Connected').to.equal('', 'You tried to use a DDP connection but it' +
            ' has not been configured. Be sure to pass --ddp=<host>');
        };
        global.ddp = {
          call: noDdp,
          apply: noDdp,
          execute: noDdp
        };
        log.debug('[chimp][helper] DDP not required');
      }
    };

    var configureChimpWidgetsDriver = function() {
      widgets.driver.api = global.browser;
    };

    try {
      setupBrowser();
      initBrowser();
      setupDdp();
      configureChimpWidgetsDriver();
    } catch (error) {
      log.error('[chimp][helper] setupBrowserAndDDP had error');
      log.error(error);
      log.error(error.stack);
      exit(2);
    }
  },

  init: function () {
    this.configureWidgets();
    this.setupGlobals();
    this.createGlobalAliases();
  }
};

global.chimpHelper = chimpHelper;
module.exports = chimpHelper;
