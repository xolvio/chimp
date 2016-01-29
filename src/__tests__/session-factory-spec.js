jest.dontMock('../lib/session-factory');
jest.dontMock('../lib/session-manager');

describe('Session Factory', function () {

  describe('Constructor', function () {

    it('sets the options on the instance when no exceptions are thrown', function () {
      var SessionFactory = require('../lib/session-factory');
      var options = {port: 1234, browser: 'something'};

      var session = new SessionFactory(options);

      expect(session.options).toBe(options);
    });

    it('throws when options is not passed', function () {
      var SessionFactory = require('../lib/session-factory');
      var session = function () {
        new SessionFactory();
      };
      expect(session).toThrowError('options is required');
    });

    it('throws when options.port is not passed', function () {
      var SessionFactory = require('../lib/session-factory');
      var options = {};
      var session = function () {
        new SessionFactory({});
      };
      expect(session).toThrowError('options.port is required');
    });

    it('throws when options.browser and options.device is not passed', function () {
      var SessionFactory = require('../lib/session-factory');
      var options = {port: 1234};
      var session = function () {
        new SessionFactory(options);
      };
      expect(session).toThrowError('[chimp][session-manager-factory] options.browser or options.deviceName is required');
    });

    it('throws when options.user and options.key is not passed and not using localhost', function () {
      var SessionFactory = require('../lib/session-factory');
      var options = {port: 1234, browser: 'firefox', host: 'browserstack.com'};
      var session = function () {
        new SessionFactory(options);
      };
      expect(session).toThrowError('[chimp][session-manager-factory] options.user and options.key are required');
    });

  });

});
