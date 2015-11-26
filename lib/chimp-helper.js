var chai            = require('chai'),
    chaiAsPromised  = require('chai-as-promised'),
    log             = require('./log'),
    DDP             = require('./ddp'),
    request         = require('request'),
    Promise         = require('bluebird'),
    _               = require('underscore'),
    wrapAsync       = require('xolvio-sync-webdriverio').wrapAsync,
    wrapAsyncObject = require('xolvio-sync-webdriverio').wrapAsyncObject,
    SessionManager  = require('./session-manager'),
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
    widgets.driver.api = global.browser;
    global.chimpWidgets = widgets;
  },

  createGlobalAliases: function () {
    global.driver = global.browser;
    global.client = global.browser;
    global.mirror = global.ddp;
    global.server = global.ddp;
  },

  setupBrowserAndDDP: function () {

    var setupBrowser = function () {
      log.debug('[chimp][hooks] getting browser');
      var remoteSession;
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

      global.sessionManager = new SessionManager({
        host: process.env['chimp.host'],
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

        if (options.multiBrowser) {
          //TODO split those into two different functions.
          remoteSession = wrapAsync(global.sessionManager.multiremote, global.sessionManager);
        } else {
          remoteSession = wrapAsync(global.sessionManager.remote, global.sessionManager);
        }
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
      //browser.initSync();
      log.debug('[chimp][hooks] init browser callback');

      if (browser.browsers) {
        browser.browsers.forEach(function(singleBrowser) {
          //singleBrowser.initSync()
          initSingleBrowser(singleBrowser)
        });
      }
      else {
        browser.initSync();
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
      log.error('[chimp][hooks] setupBrowserAndDDP had error');
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
