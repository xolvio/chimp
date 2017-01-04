jest.dontMock('../lib/ddp.js');

describe('DDP Wrapper', function () {
  var DDP = require('../lib/ddp');
  describe('constructor', function () {
    beforeEach(function () {
      delete process.env.ROOT_URL;
      for(var key in process.env) {
        if(key.indexOf('chimp.ddp') !== -1) {
          delete process.env[key];
        }
      }
    });
    it('sets ROOT_URL env var to be the chimp.ddp env var', function () {
      process.env['chimp.ddp0'] = 'http://here.com:3000';
      new DDP();
      expect(process.env.ROOT_URL).toEqual('http://here.com:3000');
    });
    it('does not change the ROOT_URL when it is provided', function () {
      process.env.ROOT_URL = 'http://somewhere.com:3000';
      process.env['chimp.ddp0'] = 'http://here.com:3000';
      new DDP();
      expect(process.env.ROOT_URL).toEqual('http://somewhere.com:3000');
    });
    it('parses the DDP host of [chimp.ddp0] if no url provided', function () {
      process.env['chimp.ddp0'] = 'http://here.com:3000';
      var ddp = new DDP();
      expect(ddp.url.host).toEqual('here.com:3000');
    });
    it('parses the DDP host of provided url', function () {
      process.env['chimp.ddp0'] = 'http://here.com:3000';
      process.env['chimp.ddp1'] = 'http://here.com:3001';
      var ddp = new DDP('http://here.com:3001');
      expect(ddp.url.host).toEqual('here.com:3001');
    });
  });
  describe('connect', function () {
    it('returns an async-wrapped DDPClient', function () {
      // TODO check that the DDPClient return value is passed to wrapAsyncObject
      // and that the connect', 'call', 'apply', 'callWithRandomSeed', 'subscribe' methods are passed in
    });
    it('does not set sync-by-default when chimp.sync is false', function () {
      // TODO
    });
  });
  describe('_getUrl', function () {
    it('throws an error if http or https are not passed', function () {
      var thrower = function () {
        new DDP()._getUrl('blah.com');
      };
      expect(thrower).toThrowError('[chimp][ddp] DDP url must contain the protocol');
    });
    it('parses http URLs', function () {
      var url = new DDP()._getUrl('http://somewhere:3000');
      expect(url.hostname).toEqual('somewhere');
      expect(url.port).toEqual('3000');
      expect(url.protocol).toEqual('http:');
    });
    it('parses https URLs', function () {
      var url = new DDP()._getUrl('https://somewhere:3000');
      expect(url.hostname).toEqual('somewhere');
      expect(url.port).toEqual('3000');
      expect(url.protocol).toEqual('https:');
    });
  });
  describe('_getOptions', function () {
    it('sets the port and hostname using the instance url object', function () {
      var ddp = new DDP();
      ddp.url = {
        hostname: 'the.host',
        port: 3130,
        protocol: 'http:'
      };
      var options = ddp._getOptions();
      expect(options.host).toEqual('the.host');
      expect(options.port).toEqual(3130);
    });
    it('sets the ssl to false when the protocol is http', function () {
      var ddp = new DDP();
      ddp.url = {
        hostname: 'the.host',
        port: 3130,
        protocol: 'http:'
      };
      var options = ddp._getOptions();
      expect(options.ssl).toEqual(false);
    });
    it('sets the ssl to true when the protocol is https', function () {
      var ddp = new DDP();
      ddp.url = {
        hostname: 'the.host',
        port: 3130,
        protocol: 'https:'
      };
      var options = ddp._getOptions();
      expect(options.ssl).toEqual(true);
    });
  });
});
