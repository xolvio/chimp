jest.dontMock('../lib/selenium');
jest.dontMock('../lib/boolean-helper');
jest.dontMock('underscore');

describe('Selenium', function () {

  describe('constructor', function () {

    it('throws when options is not passed', function () {
      var Selenium = require('../lib/selenium');
      var createSelenium = function () {
        new Selenium();
      };

      expect(createSelenium).toThrowError('options is required');
    });

    it('throws when options.port is not passed', function () {
      var Selenium = require('../lib/selenium');
      var options = {};
      var createSelenium = function () {
        new Selenium(options);
      };

      expect(createSelenium).toThrowError('options.port is required');
    });

    it('converts options.port to a string', function () {
      var Selenium = require('../lib/selenium');

      var selenium = new Selenium({port: 4444});

      expect(selenium.options.port).toBe('4444');
    });

    it('does not modify original options', function () {
      var Selenium = require('../lib/selenium');

      var originalOptions = {
        port: 4444,
        someVar: 1234
      };
      var selenium = new Selenium(originalOptions);
      originalOptions.someVar = 5678;

      expect(selenium.options.someVar).toBe(1234);
    });

    it('creates a singleton by default', function () {
      var Selenium = require('../lib/selenium');

      var selenium = new Selenium({port: 4444});

      var selenium2 = new Selenium({port: 5678});

      expect(selenium).toBe(selenium2);

    });

    it('does not create a singleton when --clean-selenium-server is true', function () {

      var Selenium = require('../lib/selenium');

      var selenium = new Selenium({port: '4444', 'clean-selenium-server': true});

      var selenium2 = new Selenium({port: 5678});

      expect(selenium).not.toBe(selenium2);

    });


  });

  describe('install', function () {

    it('installs selenium', function () {
      var Selenium = require('../lib/selenium');
      var selenium = new Selenium({
        port: '4444',
        seleniumStandaloneOptions: {},
      });
      var seleniumStandalone = require('selenium-standalone');

      selenium.install();

      expect(seleniumStandalone.install).toBeCalled();
    });

    it('passes callback to selenium-standalone call', function () {
      var Selenium = require('../lib/selenium');
      var selenium = new Selenium({
        port: '4444',
        seleniumStandaloneOptions: {},
      });
      var seleniumStandalone = require('selenium-standalone');
      var callback = jest.genMockFn();

      selenium.install(callback);
      seleniumStandalone.install.mock.calls[0][1]();

      expect(callback).toBeCalled();
    });

    it('does not run if chimp is offline mode', function () {
      var Selenium = require('../lib/selenium');
      var selenium = new Selenium({port: '4444', offline: true});
      var seleniumStandalone = require('selenium-standalone');

      var callback = jest.genMockFn();

      selenium.install(callback);

      expect(seleniumStandalone.install).not.toBeCalled();
      expect(callback.mock.calls.length).toBe(1);
    });

  });

  describe('start', function () {

    it('uses options.port to start selenium', function () {
      var Selenium = require('../lib/selenium');
      var port = '4444';
      var selenium = new Selenium({
        port: '4444',
        seleniumStandaloneOptions: {},
      });
      var seleniumStandalone = require('selenium-standalone');
      selenium.install = jest.genMockFunction();
      selenium.install.mockImplementation(function (callback) {
        callback(null);
      });

      var callback = function () {};
      selenium.start(callback);

      expect(seleniumStandalone.start.mock.calls[0][0].seleniumArgs).toEqual(['-port', port]);
    });

    it('retains pre-existing options.seleniumArgs when starting selenium', function () {
      var Selenium = require('../lib/selenium');
      var port = '4444';
      var opt = '-some-option=True';
      var selenium = new Selenium({
        port,
        seleniumStandaloneOptions: {seleniumArgs: [opt]},
      });
      var seleniumStandalone = require('selenium-standalone');
      selenium.install = jest.genMockFunction();
      selenium.install.mockImplementation(function (callback) {
        callback(null);
      });

      var callback = function () {};
      selenium.start(callback);

      expect(seleniumStandalone.start.mock.calls[0][0].seleniumArgs).toEqual([opt, '-port', port]);
    });

    it('sets this.child to the selenium child process', function () {
      var Selenium = require('../lib/selenium');
      var selenium = new Selenium({
        port: '4444',
        seleniumStandaloneOptions: {},
      });
      var seleniumStandalone = require('selenium-standalone');
      selenium.install = jest.genMockFunction();
      selenium.install.mockImplementation(function (callback) {
        callback(null);
      });
      var seleniumChild = {
        stderr: {
          on: jest.genMockFunction()
        }
      };
      seleniumStandalone.start.mockImplementation(function (options, callback) {
        callback(null, seleniumChild);
      });

      var callback = function () {};
      selenium.start(callback);

      expect(selenium.child).toBe(seleniumChild);
    });

    it('calls the callback with null when selenium has been started successfully', function () {

      var Selenium = require('../lib/selenium');
      var selenium = new Selenium({
        port: '4444',
        seleniumStandaloneOptions: {},
      });
      var seleniumStandalone = require('selenium-standalone');
      selenium.install = jest.genMockFunction();
      selenium.install.mockImplementation(function (callback) {
        callback(null);
      });
      var seleniumChild = {
        stderr: {
          on: jest.genMockFunction()
        }
      };
      seleniumStandalone.start.mockImplementation(function (options, callback) {
        callback(null, seleniumChild);
      });

      var callback = jest.genMockFunction();
      selenium.start(callback);

      expect(callback.mock.calls[0]).toEqual([null]);

    });

    it('calls the callback with the error when selenium fails to start', function () {

      var Selenium = require('../lib/selenium');
      var selenium = new Selenium({
        port: '4444',
        seleniumStandaloneOptions: {},
      });
      var seleniumStandalone = require('selenium-standalone');
      selenium.install = jest.genMockFunction();
      selenium.install.mockImplementation(function (callback) {
        callback(null);
      });
      var error = new Error('Selenium start error');
      seleniumStandalone.start.mockImplementation(function (options, callback) {
        callback(error);
      });

      var callback = jest.genMockFunction();
      selenium.start(callback);

      expect(callback.mock.calls[0]).toEqual([error]);

    });

    it('logs the output of the child process', function () {
      // TODO
    });

    it('calls the callback immediately with null when selenium is already running', function () {

      var seleniumStandalone = require('selenium-standalone');
      var Selenium = require('../lib/selenium');
      var selenium = new Selenium({port: '4444'});

      var callback = jest.genMockFunction();

      seleniumStandalone.start = jest.genMockFn();

      selenium.child = 'not null';
      selenium.start(callback);

      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toBe(null);
      expect(seleniumStandalone.start.mock.calls.length).toBe(0);

    });

  });

  describe('stop', function () {

    describe('when selenium is running', function () {

      it('kills the selenium child', function () {
        var Selenium = require('../lib/selenium');
        var selenium = new Selenium({port: '4444'});
        var processHelper = require('../lib/process-helper');
        var seleniumChild = {
          pid: 1234
        };
        selenium.child = seleniumChild;
        selenium.sessionManager = {};

        var callback = jest.genMockFunction();
        selenium.stop(callback);

        expect(processHelper.kill.mock.calls.length).toBe(1);
        expect(processHelper.kill.mock.calls[0][0]).toEqual({
          child: selenium.child,
          signal: 'SIGINT',
          prefix: 'selenium'
        });

        // simulate the callback
        processHelper.kill.mock.calls[0][1]('this', 'that');

        expect(selenium.child).toBe(null);
        expect(callback).toBeCalledWith('this', 'that');

      });

    });

    describe('when selenium is not running', function () {

      it('calls the callback immediately', function () {
        var Selenium = require('../lib/selenium');
        var selenium = new Selenium({port: '4444'});

        var callback = jest.genMockFunction();
        selenium.stop(callback);

        expect(selenium.child).toBe(null);
        expect(callback).toBeCalledWith(null);

      });

    });

  });

  describe('interrupt', function () {

    it('should return immediately in watch mode', function () {

      var Selenium = require('../lib/selenium');
      var selenium = new Selenium({port: '4444', watch: true});

      var callback = jest.genMockFunction();

      selenium.stop = jest.genMockFn();

      selenium.interrupt(callback);

      expect(callback).toBeCalledWith(null);
      expect(selenium.stop.mock.calls.length).toBe(0);

    });

    it('should call kill when not in watch mode', function () {

      var Selenium = require('../lib/selenium');
      var selenium = new Selenium({port: '4444'});

      var callback = jest.genMockFunction();

      selenium.stop = jest.genMockFn();

      selenium.interrupt(callback);

      expect(selenium.stop.mock.calls.length).toBe(1);
      expect(selenium.stop.mock.calls.length).toBe(1);

    });

    it('should call kill when --clean-selenium-server is true', function () {

      var Selenium = require('../lib/selenium');
      var selenium = new Selenium({port: '4444', 'clean-selenium-server': true});

      selenium.stop = jest.genMockFn();

      var callback = 'callback';
      selenium.interrupt(callback);

      expect(selenium.stop.mock.calls.length).toBe(1);
      expect(selenium.stop.mock.calls[0][0]).toBe(callback);

    });

  });

});
