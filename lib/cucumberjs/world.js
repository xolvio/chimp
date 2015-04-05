/*!
 * Cuker World
 */

var wd             = require('webdriverio'),
    chai           = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    DDPClient      = require("ddp");

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
    global.ddp = new DDPClient({
      host: process.env['cuker.ddp_host'],
      port: process.env['cuker.ddp_port'],
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

  this.World = function World (callback) {
    this.browser = global.browser;

    this.ddp = global.ddp;
    if (process.env['cuker.ddp']) {
      this.ddp.connect(function (error) {
        if (error) {
          console.error('DDP connection error!', error);
          callback.fail();
        } else {
          callback();
        }
      })
    }
    else {
      callback();
    }

    return this;
  };
};
