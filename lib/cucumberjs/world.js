var chai           = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    DDPClient      = require('ddp'),
    fs             = require('fs'),
    path           = require('path'),
    log            = require('../log'),
    widgets        = require('chimp-widgets'),
    request        = require('request'),
    Promise        = require('bluebird');
var wrapAsync      = require('../fiber-utils').wrapAsync;
var wrapAsyncObject = require('../fiber-utils').wrapAsyncObject;

chai.use(chaiAsPromised);
chai.should();

module.exports = function () {

  var syncByDefault = process.env['chimp.sync'] !== 'false';

  global.wrapAsync = wrapAsync;
  global.wrapAsyncObject = wrapAsyncObject;

  // give users access to the chai instance
  global.chai = chai;
  global.expect = chai.expect;
  global.assert = chai.assert;

  // give users access the request module
  global.request = request;
  wrapAsyncObject(global, ['request'], {
    syncByDefault: syncByDefault
  });

  // Give the user access to Promise functions. E.g. Promise.all.
  global.Promise = Promise;

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
    wrapAsyncObject(
      global.ddp,
      ['connect', 'call', 'apply', 'callWithRandomSeed', 'subscribe'],
      {syncByDefault: syncByDefault}
    );
  }

  this.World = function World (callback) {
    log.debug('[chimp][world] setting up world');
    this.browser = global.browser;
    this.ddp = global.ddp;
    widgets.driver.api = global.browser;
    this.widgets = widgets;
    this.request = request;

    // ALIASES
    this.driver = global.browser;
    this.client = global.browser;
    this.mirror = global.ddp;
    this.server = global.ddp;

    global.driver = this.driver;
    global.client = this.client;
    global.mirror = this.mirror;
    global.server = this.server;

    callback();
    return this;
  };

};
