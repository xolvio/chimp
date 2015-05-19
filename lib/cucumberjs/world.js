var chai           = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    DDPClient      = require('ddp'),
    fs             = require('fs'),
    path           = require('path'),
    log            = require('../log'),
    widgets        = require('chimp-widgets');

chai.use(chaiAsPromised);
chai.should();

module.exports = function () {

  // give users access to the chai instance
  global.chai = chai;

  if (process.env['chimp.ddp']) {
    log.debug('[chimp][world] creating DDP connection');
    process.env.ROOT_URL = process.env.ROOT_URL || process.env['chimp.ddp'];
    global.ddp = new DDPClient({
      host: process.env['chimp.ddp'].match(/http:\/\/(.*):/)[1],
      port: process.env['chimp.ddp'].match(/:([0-9]+)/)[1],
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

  this.World = function World (callback) {
    log.debug('[chimp][world] setting up world');
    this.browser = global.browser;
    this.ddp = global.ddp;
    widgets.driver.api = global.browser;
    this.widgets = widgets;

    // ALIASES
    this.driver = global.browser;
    this.client = global.browser;
    this.mirror = global.ddp;

    callback();
    return this;
  };

};
