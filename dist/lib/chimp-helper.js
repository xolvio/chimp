'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var chai = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    log = require('./log'),
    DDP = require('./ddp'),
    request = require('request'),
    Promise = require('bluebird'),
    _ = require('underscore'),
    wrapAsync = require('xolvio-sync-webdriverio').wrapAsync,
    wrapAsyncObject = require('xolvio-sync-webdriverio').wrapAsyncObject,
    SessionFactory = require('./session-factory'),
    widgets = require('chimp-widgets'),
    path = require('path'),
    colors = require('colors'),
    fs = require('fs-extra'),
    exit = require('exit'),
    booleanHelper = require('./boolean-helper');

var chimpHelper = {
  loadAssertionLibrary: function loadAssertionLibrary() {
    if (booleanHelper.isTruthy(process.env['chimp.chai'])) {
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

  setupGlobals: function setupGlobals() {
    global.wrapAsync = wrapAsync;
    global.wrapAsyncObject = wrapAsyncObject;

    // give users access the request module
    global.request = request;
    _.extend(global, wrapAsyncObject(global, ['request'], {
      syncByDefault: booleanHelper.isTruthy(process.env['chimp.sync'])
    }));

    // Give the user access to Promise functions. E.g. Promise.all.
    global.Promise = Promise;

    if (booleanHelper.isTruthy(process.env['chimp.ddp'])) {
      global.ddp = new DDP().connect();
    }
  },

  configureWidgets: function configureWidgets() {
    // CHIMP WIDGETS
    widgets.driver.api = global.browser;
    global.chimpWidgets = widgets;
  },

  createGlobalAliases: function createGlobalAliases() {
    global.driver = global.browser;
    global.client = global.browser;
    global.mirror = global.ddp;
    global.server = global.ddp;
  },

  setupBrowserAndDDP: function setupBrowserAndDDP() {

    var setupBrowser = function setupBrowser() {
      log.debug('[chimp][helper] getting browser');
      var remoteSession;
      var customChimpConfigPath = path.resolve(process.cwd(), process.env['chimp.path'], 'chimp.js');

      var _translateLogLevel = function _translateLogLevel() {
        if (booleanHelper.isTruthy(process.env['chimp.webdriverLogLevel'])) {
          return process.env['chimp.webdriverLogLevel'];
        } else if (process.env['chimp.log'] === 'info' || process.env['chimp.log'] === 'warn' || process.env['chimp.log'] === 'error') {
          return 'silent';
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
          sync: booleanHelper.isTruthy(process.env['chimp.sync']),
          multiBrowser: false
        };

        webdriverOptions.desiredCapabilities.chromeOptions = webdriverOptions.desiredCapabilities.chromeOptions || {};
        if (booleanHelper.isTruthy(process.env['chimp.chromeBin'])) {
          webdriverOptions.desiredCapabilities.chromeOptions.binary = process.env['chimp.chromeBin'];
        }
        if (booleanHelper.isTruthy(process.env['chimp.chromeArgs'])) {
          webdriverOptions.desiredCapabilities.chromeOptions.args = process.env['chimp.chromeArgs'].split(',');
        } else if (booleanHelper.isTruthy(process.env['chimp.chromeNoSandbox'])) {
          webdriverOptions.desiredCapabilities.chromeOptions.args = ['no-sandbox'];
        }

        if (booleanHelper.isTruthy(process.env['chimp.baseUrl'])) {
          webdriverOptions.baseUrl = process.env['chimp.baseUrl'];
        }
        if (process.env['chimp.watch']) {
          webdriverOptions.desiredCapabilities.applicationCacheEnabled = false;
        }
        webdriverOptions.desiredCapabilities['tunnelIdentifier'] = process.env['chimp.tunnelIdentifier'];
        webdriverOptions.desiredCapabilities['browserstack.local'] = process.env['chimp.browserstackLocal'];

        log.debug('[chimp][helper] webdriverOptions are ', (0, _stringify2.default)(webdriverOptions));

        if (process.env['CUCUMBER_BROWSERS']) {
          var options = _.clone(webdriverOptions);
          options.multiBrowser = true;
          var _browsersTotal = parseInt(process.env['CUCUMBER_BROWSERS']);
          for (var _browserIndex = 0; _browserIndex < _browsersTotal; _browserIndex++) {
            webdriverOptions['browser' + _browserIndex] = _.clone(options);
          }
          remoteSession = wrapAsync(global.sessionManager.multiremote, global.sessionManager);
        } else {
          remoteSession = wrapAsync(global.sessionManager.remote, global.sessionManager);
        }
        global.browser = remoteSession(webdriverOptions);
      }

      chaiAsPromised.transferPromiseness = global.browser.transferPromiseness;
    };

    var initSingleBrowser = function initSingleBrowser(browser) {
      log.debug('[chimp][helper] init browser');
      //browser.initSync();
      log.debug('[chimp][helper] init browser callback');

      browser.screenshotsCount = 0;
      browser.addCommand('capture', function (name) {
        name = name.replace(/[ \\~#%&*{}/:<>?|"-]/g, '_');
        var location = browser.screenshotsCount++ + '_' + name + '.png';
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
          width: process.env['chimp.phantom_w'] ? parseInt(process.env['chimp.phantom_w']) : 1280,
          height: process.env['chimp.phantom_h'] ? parseInt(process.env['chimp.phantom_h']) : 1024
        });
      }
    };

    var initBrowser = function initBrowser() {
      log.debug('[chimp][hooks] init browser');
      var browser = global.browser;
      //browser.initSync();
      log.debug('[chimp][hooks] init browser callback');

      if (browser.browsers) {
        browser.browsers.forEach(function (singleBrowser) {
          singleBrowser.initSync();
          initSingleBrowser(singleBrowser);
        });
      } else {
        browser.initSync();
        initSingleBrowser(browser);
      }
    };

    var addServerExecute = function addServerExecute() {
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

    var setupDdp = function setupDdp() {
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
        var noDdp = function noDdp() {
          expect('DDP Not Connected').to.equal('', 'You tried to use a DDP connection but it' + ' has not been configured. Be sure to pass --ddp=<host>');
        };
        global.ddp = {
          call: noDdp,
          apply: noDdp,
          execute: noDdp
        };
        log.debug('[chimp][helper] DDP not required');
      }
    };

    var configureChimpWidgetsDriver = function configureChimpWidgetsDriver() {
      widgets.driver.api = global.browser;
    };

    try {
      setupBrowser();
      initBrowser();
      if (booleanHelper.isTruthy(process.env['chimp.ddp'])) {
        setupDdp();
      }
      configureChimpWidgetsDriver();
    } catch (error) {
      log.error('[chimp][helper] setupBrowserAndDDP had error');
      log.error(error);
      log.error(error.stack);
      exit(2);
    }
  },

  init: function init() {
    this.configureWidgets();
    this.setupGlobals();
    this.createGlobalAliases();
  }
};

global.chimpHelper = chimpHelper;
module.exports = chimpHelper;