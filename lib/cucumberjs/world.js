var SessionManager = require('../session-manager.js'),
    chai           = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    DDPClient      = require('ddp'),
    fs             = require('fs'),
    path           = require('path'),
    log            = require('../log');

chai.use(chaiAsPromised);
chai.should();

module.exports = function () {

  // give users access to the chai instance
  global.chai = chai;

  if (process.env['monkey.ddp']) {
    log.debug('[cuke-monkey][world] creating DDP connection');
    process.env.ROOT_URL = process.env.ROOT_URL || process.env['monkey.ddp'];
    global.ddp = new DDPClient({
      host: process.env['monkey.ddp'].match(/http:\/\/(.*):/)[1],
      port: process.env['monkey.ddp'].match(/:([0-9]+)/)[1],
      // TODO extract all options
      ssl: false,
      autoReconnect: true,
      autoReconnectTimer: 500,
      maintainCollections: true,
      ddpVersion: '1',
      useSockJs: true
      //path: "websocket"
    });
  }

  log.debug('[cuke-monkey][world] getting browser');
  var configPath = path.resolve(process.cwd(), process.env['monkey.path'], 'monkey.js');

  var _translateLogLevel = function () {
    if (process.env['monkey.log'] === 'info' ||
      process.env['monkey.log'] === 'warn' ||
      process.env['monkey.log'] === 'error') {
      return 'silent'
    }
    return process.env['monkey.log'];
  };

  var browser;
  if (fs.existsSync(configPath)) {
    // load monkey webdriver configuration
    browser = require(configPath)(this);
    callback(browser);
  } else {
    log.debug('[cuke-monkey][world] no configPath found');
    var webdriverOptions = {
      desiredCapabilities: {
        browserName: process.env['monkey.browser'],
        platform: process.env['monkey.platform'],
        name: process.env['monkey.name']
      },
      user: process.env['monkey.user'] || process.env.SAUCE_USERNAME,
      key: process.env['monkey.key'] || process.env.SAUCE_ACCESS_KEY,
      host: process.env['monkey.host'],
      port: process.env['monkey.port'],
      logLevel: _translateLogLevel(),
      screenshotPath: process.env['monkey.screenshotPath']
    };
    log.debug('[cuke-monkey][world] webdriverOptions are ', JSON.stringify(webdriverOptions));
    var sessionManager = new SessionManager({
      port: process.env['monkey.port'],
      browser: process.env['monkey.browser']
    });

    browser = sessionManager.remote(webdriverOptions);
  }

  global.browser = browser;

  chaiAsPromised.transferPromiseness = global.browser.transferPromiseness;

  this.World = function World (callback) {
    log.debug('[cuke-monkey][world] setting up world');
    this.browser = global.browser;
    this.ddp = global.ddp;
    callback();
    return this;
  };
};
