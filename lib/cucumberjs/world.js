var chai           = require('chai'),
    chaiAsPromised = require('chai-as-promised'),
    DDPClient      = require('ddp'),
    fs             = require('fs'),
    path           = require('path'),
    log            = require('../log'),
    widgets        = require('chimp-widgets'),
    request        = require('request'),
    Promise        = require('bluebird');
var _ = require('underscore');
var wrapAsync = require('xolvio-sync-webdriverio').wrapAsync;
var wrapAsyncObject = require('xolvio-sync-webdriverio').wrapAsyncObject;

chai.use(chaiAsPromised);
chai.should();

module.exports = function () {

  var syncByDefault = process.env['chimp.sync'] !== 'false';

  global.wrapAsync = wrapAsync;
  global.wrapAsyncObject = wrapAsyncObject;

  if (process.env['chimp.chai']) {
    log.debug('[chimp][world] Using the chai-expect assertion library');
    // give users access to the chai instance
    global.expect = chai.expect;
    global.chai = chai;
    global.assert = chai.assert;
  } else {
    log.debug('[chimp][world] Using the jasmine-expect assertion library');
    global.expect = require('xolvio-jasmine-expect').expect;
  }

  // give users access the request module
  global.request = request;
  _.extend(global, wrapAsyncObject(global, ['request'], {
    syncByDefault: syncByDefault
  }));

  // Give the user access to Promise functions. E.g. Promise.all.
  global.Promise = Promise;

  if (process.env['chimp.ddp']) {
    log.debug('[chimp][world] creating DDP connection');
    process.env.ROOT_URL = process.env.ROOT_URL || process.env['chimp.ddp'];
    global.ddp = wrapAsyncObject(
      new DDPClient({
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
      }),
      ['connect', 'call', 'apply', 'callWithRandomSeed', 'subscribe'],
      {syncByDefault: syncByDefault}
    );
  }

  this.World = function World (callback) {
    log.debug('[chimp][world] setting up world');

    // WORLD CONTEXT
    this.browser = global.browser;
    this.ddp = global.ddp;
    this.request = request;

    // ALIASES
    this.driver = global.browser;
    this.client = global.browser;
    this.mirror = global.ddp;
    this.server = global.ddp;

    // GLOBALS
    global.driver = this.driver;
    global.client = this.client;
    global.mirror = this.mirror;
    global.server = this.server;

    // CHIMP WIDGETS
    widgets.driver.api = global.browser;
    this.widgets = widgets;

    callback();
    return this;
  };

};
