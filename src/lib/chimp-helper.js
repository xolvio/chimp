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
    exit            = require('exit'),
    booleanHelper   = require('./boolean-helper');
import merge from 'deepmerge';
import {
  parseNullableString,
  parseNullableInteger,
  parseBoolean } from './environment-variable-parsers';

var chimpHelper = {
  loadAssertionLibrary: function () {
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

  setupGlobals: function () {
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

    var setupBrowser = function () {
      log.debug('[chimp][helper] getting browser');

      const webdriverioConfigOptions = JSON.parse(process.env['chimp.webdriverio']);
      const webdriverioOptions = merge(
        webdriverioConfigOptions,
        {
          desiredCapabilities: {
            browserName: parseNullableString(process.env['chimp.browser']),
            platform: parseNullableString(process.env['chimp.platform']),
            name: parseNullableString(process.env['chimp.name']),
            version: parseNullableString(process.env['chimp.version']),
            deviceName: parseNullableString(process.env['chimp.deviceName']),
          },
          user: parseNullableString(process.env['chimp.user'] || process.env.SAUCE_USERNAME),
          key: parseNullableString(process.env['chimp.key'] || process.env.SAUCE_ACCESS_KEY),
          host: parseNullableString(process.env['chimp.host']),
          port: parseNullableInteger(process.env['chimp.port']),
          logLevel: booleanHelper.isTruthy(process.env['chimp.debug']) ?
            'verbose' : webdriverioConfigOptions.logLevel,
          sync: parseBoolean(process.env['chimp.sync']),
        }
      );

      global.sessionManager = new SessionFactory(Object.assign(
        _.pick(webdriverioOptions, 'host', 'port', 'user', 'key'),
        {
          browser: webdriverioOptions.desiredCapabilities.browserName,
          deviceName: webdriverioOptions.desiredCapabilities.deviceName,
        }
      ));

      if (booleanHelper.isTruthy(process.env['chimp.watch'])) {
        webdriverioOptions.desiredCapabilities.applicationCacheEnabled = false;
      }

      log.debug('[chimp][helper] webdriverioOptions are ', JSON.stringify(webdriverioOptions));

      const remoteSession = wrapAsync(global.sessionManager.remote, global.sessionManager);
      global.browser = remoteSession(webdriverioOptions);

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

      if (process.env['chimp.browser'] === 'phantomjs') {
        browser.setViewportSizeSync({
          width: process.env['chimp.phantom_w']?parseInt(process.env['chimp.phantom_w']):1280,
          height: process.env['chimp.phantom_h']?parseInt(process.env['chimp.phantom_h']):1024
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

  init: function () {
    this.configureWidgets();
    this.setupGlobals();
    this.createGlobalAliases();
  }
};

global.chimpHelper = chimpHelper;
module.exports = chimpHelper;
