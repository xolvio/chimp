jest.dontMock('../lib/phantom');

describe('Phantom', function () {

  describe('constructor', function () {

    var Phantom = require('../lib/phantom');

    it('throws when options is not passed', function () {

      var createPhantom = function () {
        new Phantom();
      };

      expect(createPhantom).toThrowError('options is required');
    });

    it('throws when options.port is not passed', function () {

      var options = {};
      var createPhantom = function () {
        new Phantom(options);
      };

      expect(createPhantom).toThrowError('options.port is required');
    });

  });

  describe('start', function () {

    it('uses options.port to start phantom in webdriver mode', function () {
      var processHelper = require('../lib/process-helper');
      var Phantom = require('../lib/phantom');

      var phantom = new Phantom({port: 9876});

      phantom.start();

      expect(processHelper.start.mock.calls.length).toBe(1);
      expect(processHelper.start.mock.calls[0][0].args).toEqual(['--webdriver', 9876, '--ignore-ssl-errors', 'false']);
    });

    it('sets this.child to the phantom child process', function () {

      var processHelper = require('../lib/process-helper');
      var Phantom = require('../lib/phantom');

      var childProcess = {};
      processHelper.start.mockReturnValue(childProcess);

      var phantom = new Phantom({port: 9876});
      expect(phantom.child).toBe(null);

      phantom.start(null);

      expect(phantom.child).toBe(childProcess);
    });

    it('calls the callback with null when phantom starts successfully', function () {

      var processHelper = require('../lib/process-helper');
      var Phantom = require('../lib/phantom');

      processHelper.start = jest.genMockFn().mockImplementation(function (options, callback) {
        callback();
      });

      var phantom = new Phantom({port: 9876});
      var callback = jest.genMockFn();

      phantom.start(callback);

      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toBeFalsy();

    });

    it('calls the callback with the error when phantom fails to start', function () {

      var processHelper = require('../lib/process-helper');
      var Phantom = require('../lib/phantom');

      processHelper.start = jest.genMockFn().mockImplementation = function (options, callback) {
        callback('error!');
      };

      var phantom = new Phantom({port: 9876});
      var callback = jest.genMockFn();

      phantom.start(callback);

      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toBe('error!');
    });

    it('immediately calls the callback without starting phantom if already running', function () {

      var processHelper = require('../lib/process-helper');
      var Phantom = require('../lib/phantom');

      var phantom = new Phantom({port: 9876});
      phantom.child = 'not null';

      var callback = jest.genMockFn();
      phantom.start(callback);

      expect(processHelper.start.mock.calls.length).toBe(0);
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toBeFalsy();
      expect(phantom.child).toBe('not null');

    });

  });

  describe('stop', function () {

    it('kills the phantom child when phantom is running and sets the child to null', function () {

      var processHelper = require('../lib/process-helper');
      var Phantom = require('../lib/phantom');

      var phantom = new Phantom({port: 9876});
      phantom.child = 'not null';

      processHelper.kill = jest.genMockFn().mockImplementation(function (options, callback) {
        callback();
      });

      var callback = jest.genMockFn();
      phantom.stop(callback);

      expect(processHelper.kill.mock.calls.length).toBe(1);
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toBeFalsy();
      expect(phantom.child).toBe(null);

    });

    it('calls the callback immediately when phantom is not running', function () {

      var processHelper = require('../lib/process-helper');
      var Phantom = require('../lib/phantom');

      var phantom = new Phantom({port: 9876});
      phantom.child = null;

      processHelper.kill = jest.genMockFn();

      var callback = jest.genMockFn();
      phantom.stop(callback);

      expect(processHelper.kill.mock.calls.length).toBe(0);
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toBeFalsy();
      expect(phantom.child).toBe(null);

    });

    it('calls the callback with an error if an error is encountered', function () {
      var processHelper = require('../lib/process-helper');
      var Phantom = require('../lib/phantom');

      var phantom = new Phantom({port: 9876});
      phantom.child = 'not null';

      processHelper.kill = jest.genMockFn().mockImplementation(function (options, callback) {
        callback('Error!');
      });

      var callback = jest.genMockFn();
      phantom.stop(callback);

      expect(processHelper.kill.mock.calls.length).toBe(1);
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toBe('Error!');
    });

  });

  describe('interrupt', function () {

    it('should stop phantom', function () {

      var Phantom = require('../lib/phantom');

      var phantom = new Phantom({port: 9876});

      phantom.stop = jest.genMockFn();

      var callback = 'callback';
      phantom.interrupt(callback);

      expect(phantom.stop.mock.calls.length).toBe(1);
      expect(phantom.stop.mock.calls[0][0]).toBe(callback);

    });

  });

});
