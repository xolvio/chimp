/*!
 * Cuker World
 */

var wd             = require('webdriverio'),
    chai           = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    DDPClient      = require('ddp'),
    fs = require('fs'),
    path = require('path');

// setup assertions
chai.use(chaiAsPromised);
chai.should();

module.exports = function () {
  global.browser = wd.remote({
    desiredCapabilities: {
      browserName: process.env['cuker.browser'],
      platform: process.env['cuker.platform'],
      name: process.env['cuker.name']
    },
    user: process.env['cuker.user'] || process.env.SAUCE_USERNAME,
    key: process.env['cuker.key'] || process.env.SAUCE_ACCESS_KEY,
    host: process.env['cuker.host'],
    port: process.env['cuker.port'],
    logLevel: process.env['cuker.log']
  });

  if (process.env['cuker.ddp']) {
    process.env.ROOT_URL=process.env.ROOT_URL || process.env['cuker.ddp'];
    global.ddp = new DDPClient({
      host: process.env['cuker.ddp'].match(/http:\/\/(.*):/)[1],
      port: process.env['cuker.ddp'].match(/:([0-9]+)/)[1],
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

  // setup promises
  chaiAsPromised.transferPromiseness = global.browser.transferPromiseness;

  global.browser.init(function () {
    var sessionID = this.requestHandler.sessionID;

    this.timeoutsAsyncScript(parseInt(process.env['cuker.timeoutsAsyncScript']));

    // load cuker webdriver configuration
    var configPath = path.resolve(process.cwd(), process.env['cuker.path'], 'cuker.js');
    if (fs.existsSync(configPath)) {
      global.browser = require(configPath)(this);
    }

    // helper method for sending test results to SauceLabs
    global.browser.addCommand('sauceJobStatus', function (status, done) {
      var sauceAccount = new SauceLabs({
        username: process.env['cuker.user'] || process.env.SAUCE_USERNAME,
        password: process.env['cuker.key'] || process.env.SAUCE_ACCESS_KEY
      });
      sauceAccount.updateJob(sessionID, status, done);
    });

    global.browser.setViewportSize({
      width: process.env['cuker.phantom_w'] || 1280,
      height: process.env['cuker.phantom_h'] || 1024
    });
  });

  this.World = function World (callback) {
    this.browser = global.browser;
    this.ddp = global.ddp;
    callback();
    return this;
  };
};
