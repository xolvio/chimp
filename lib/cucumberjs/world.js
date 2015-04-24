/*!
 * Monkey World
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
  var configPath = path.resolve(process.cwd(), process.env['monkey.path'], 'monkey.js');
  if (fs.existsSync(configPath)) {
    // load monkey webdriver configuration
    global.browser = require(configPath)(this);
  } else {
    global.browser = wd.remote({
      desiredCapabilities: {
        browserName: process.env['monkey.browser'],
        platform: process.env['monkey.platform'],
        name: process.env['monkey.name']
      },
      user: process.env['monkey.user'] || process.env.SAUCE_USERNAME,
      key: process.env['monkey.key'] || process.env.SAUCE_ACCESS_KEY,
      host: process.env['monkey.host'],
      port: process.env['monkey.port'],
      logLevel: process.env['monkey.log']
    });
  }

  if (process.env['monkey.ddp']) {
    process.env.ROOT_URL=process.env.ROOT_URL || process.env['monkey.ddp'];
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

  // setup promises
  chaiAsPromised.transferPromiseness = global.browser.transferPromiseness;

  this.World = function World (callback) {
    this.browser = global.browser;
    this.ddp = global.ddp;
    callback();
    return this;
  };
};
