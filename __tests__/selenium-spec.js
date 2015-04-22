jest.dontMock('../lib/selenium');
jest.dontMock('underscore');

describe('Selenium', function () {

  describe('constructor', function () {

    it('throws when options is not passed', function () {
      var Selenium = require('../lib/selenium');
      var createSelenium = function () {
        new Selenium();
      }

      expect(createSelenium).toThrow('options is required');
    });

    it('throws when options.port is not passed', function () {
      var Selenium = require('../lib/selenium');
      var options = {};
      var createSelenium = function () {
        new Selenium(options);
      }

      expect(createSelenium).toThrow('options.port is required');
    });

    it('converts options.port to a string', function () {
      var Selenium = require('../lib/selenium');

      var selenium = new Selenium({port: 4444});

      expect(selenium.options.port).toBe('4444');
    });

  });

  describe('install', function () {

    it('installs selenium', function () {
      var Selenium = require('../lib/selenium');
      var selenium = new Selenium({port: '4444'});
      var seleniumStandalone = require('selenium-standalone');

      selenium.install();

      expect(seleniumStandalone.install).toBeCalled();
    });

    it('passes callback to selenium-standalone call', function () {
      var Selenium = require('../lib/selenium');
      var selenium = new Selenium({port: '4444'});
      var seleniumStandalone = require('selenium-standalone');
      var callback = function () {};

      selenium.install(callback);

      expect(seleniumStandalone.install.mock.calls[0][1]).toBe(callback);
    });

  });

  describe('run', function () {

    it('uses options.port to start selenium', function () {
      var Selenium = require('../lib/selenium');
      var port = '4444';
      var selenium = new Selenium({port: port});
      var seleniumStandalone = require('selenium-standalone');
      selenium.install = jest.genMockFunction();
      selenium.install.mockImplementation(function (callback) {
        callback(null);
      })

      var callback = function () {};
      selenium.run(callback);

      expect(seleniumStandalone.start.mock.calls[0][0].seleniumArgs).toEqual(['-port', port]);
    });

    it('sets this.child to the selenium child process', function () {
      var Selenium = require('../lib/selenium');
      var selenium = new Selenium({port: '4444'});
      var seleniumStandalone = require('selenium-standalone');
      selenium.install = jest.genMockFunction();
      selenium.install.mockImplementation(function (callback) {
        callback(null);
      })
      var seleniumChild = {};
      seleniumStandalone.start.mockImplementation(function (options, callback) {
        callback(null, seleniumChild);
      })

      var callback = function () {};
      selenium.run(callback);

      expect(selenium.child).toBe(seleniumChild);
    });

    describe('when selenium has been started successfully', function () {

      it('calls the callback with null', function () {
        var Selenium = require('../lib/selenium');
        var selenium = new Selenium({port: '4444'});
        var seleniumStandalone = require('selenium-standalone');
        selenium.install = jest.genMockFunction();
        selenium.install.mockImplementation(function (callback) {
          callback(null);
        })
        var seleniumChild = {};
        seleniumStandalone.start.mockImplementation(function (options, callback) {
          callback(null, seleniumChild);
        })

        var callback = jest.genMockFunction();
        selenium.run(callback);

        expect(callback.mock.calls[0]).toEqual([null]);
      });

    });

    describe('when starting selenium failed', function () {

      it('calls the callback with the error', function () {
        var Selenium = require('../lib/selenium');
        var selenium = new Selenium({port: '4444'});
        var seleniumStandalone = require('selenium-standalone');
        selenium.install = jest.genMockFunction();
        selenium.install.mockImplementation(function (callback) {
          callback(null);
        })
        var error = new Error('Selenium start error');
        seleniumStandalone.start.mockImplementation(function (options, callback) {
          callback(error);
        })

        var callback = jest.genMockFunction();
        selenium.run(callback);

        expect(callback.mock.calls[0]).toEqual([error]);
      });

    });

  });

  describe('interrupt', function () {

    describe('when selenium is running', function () {

      it('kills the selenium child', function () {
        var Selenium = require('../lib/selenium');
        var selenium = new Selenium({port: '4444'});
        var seleniumChild = {
          kill: jest.genMockFunction()
        };
        selenium.child = seleniumChild;

        var callback = jest.genMockFunction();
        selenium.interrupt(callback);

        expect(seleniumChild.kill).toBeCalled();
        expect(selenium.child).toBe(null);
        expect(callback).toBeCalledWith(null);
      });

    });

    describe('when selenium is not running', function () {

      it('calls the callback immediately', function () {
        var Selenium = require('../lib/selenium');
        var selenium = new Selenium({port: '4444'});

        var callback = jest.genMockFunction();
        selenium.interrupt(callback);

        expect(callback).toBeCalledWith(null);
      });

    });

  });

});
