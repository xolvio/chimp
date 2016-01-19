jest.dontMock('underscore');
jest.dontMock('../lib/session-manager');

//jest.dontMock('loglevel');
//require('loglevel').setLevel('TRACE');

describe('Session Manager', function () {

  describe('Constructor', function () {

    it('sets the options on the instance when no exceptions are thrown', function () {
      var SessionManager = require('../lib/session-manager');
      var options = {port: 1234, browser: 'something'};

      var sessionManager = new SessionManager(options);

      expect(sessionManager.options).toBe(options);
    });

  });

  describe('Remote', function () {

    beforeEach(function () {
      delete process.env['chimp.noSessionReuse'];
      delete process.env['chimp.watch'];
    });

    it('should delegate the webdriver remote call if using phantom', function () {

      var wd = require('xolvio-sync-webdriverio');
      var SessionManager = require('../lib/session-manager');

      wd.remote = jest.genMockFn().
        mockReturnValueOnce('return from remote1').
        mockReturnValueOnce('return from remote2');
      var sessionManager = new SessionManager({port: 1234, browser: 'phantomjs'});

      var sessions = [1234];
      sessionManager._getWebdriverSessions = jest.genMockFn().mockImpl(function (callback) {
        callback(sessions);
      });
      sessionManager._waitForConnection = jest.genMockFn().mockImpl(function (browser, callback) {
        callback();
      });

      var options = {some: 'options'};

      var callback = jest.genMockFn();
      sessionManager.remote(options, callback);
      sessionManager.remote(options, callback);


      expect(wd.remote.mock.calls.length).toBe(2);
      expect(callback.mock.calls[0][1]).toBe('return from remote1');
      expect(callback.mock.calls[1][1]).toBe('return from remote2');
      expect(wd.remote.mock.calls[0][0]).toBe(options);
      expect(wd.remote.mock.calls[1][0]).toBe(options);

    });

    it('should delegate the webdriver remote call if a session has not already started', function () {

      var wd = require('xolvio-sync-webdriverio');
      var SessionManager = require('../lib/session-manager');

      wd.remote = jest.genMockFn().mockReturnValue('return from remote');

      var sessionManager = new SessionManager({port: 1234, browser: 'something'});

      var sessions = [];
      sessionManager._getWebdriverSessions = jest.genMockFn().mockImpl(function (callback) {
        callback(null, sessions);
      });
      sessionManager._waitForConnection = jest.genMockFn().mockImpl(function (browser, callback) {
        callback();
      });

      var options = {some: 'options'};
      var callback = jest.genMockFn();
      sessionManager.remote(options, callback);

      expect(callback.mock.calls[0][1]).toBe('return from remote');
      expect(wd.remote.mock.calls.length).toBe(1);
      expect(wd.remote.mock.calls[0][0]).toBe(options);

    });

    it('should reuse a session if one has already started in watch mode', function () {

      var wd = require('xolvio-sync-webdriverio');
      var SessionManager = require('../lib/session-manager');

      process.env['chimp.watch'] = true;
      var browser = {_original: {requestHandler: {sessionID: 'some-id'}}};
      wd.remote = jest.genMockFn().mockReturnValue(browser);

      var sessionManager = new SessionManager({port: 1234, browser: 'something'});

      var sessions = [{id: 'session-id'}];
      sessionManager._getWebdriverSessions = jest.genMockFn().mockImplementation(function (callback) {
        callback(null, sessions);
      });
      sessionManager._waitForConnection = jest.genMockFn().mockImpl(function (browser, callback) {
        callback();
      });

      var options = {some: 'options'};
      var callback = jest.genMockFn();
      sessionManager.remote(options, callback);


      expect(callback.mock.calls[0][1]).toBe(browser);
      expect(browser._original.requestHandler.sessionID).toBe(sessions[0].id);

      expect(wd.remote.mock.calls.length).toBe(1);
      expect(wd.remote.mock.calls[0][0]).toBe(options);

    });

    it('should reuse a session if one has already started in server mode', function () {

      var wd = require('xolvio-sync-webdriverio');
      var SessionManager = require('../lib/session-manager');

      process.env['chimp.server'] = true;
      var browser = {_original: {requestHandler: {sessionID: 'some-id'}}};
      wd.remote = jest.genMockFn().mockReturnValue(browser);

      var sessionManager = new SessionManager({port: 1234, browser: 'something'});

      var sessions = [{id: 'session-id'}];
      sessionManager._getWebdriverSessions = jest.genMockFn().mockImplementation(function (callback) {
        callback(null, sessions);
      });
      sessionManager._waitForConnection = jest.genMockFn().mockImpl(function (browser, callback) {
        callback();
      });

      var options = {some: 'options'};
      var callback = jest.genMockFn();
      sessionManager.remote(options, callback);


      expect(callback.mock.calls[0][1]).toBe(browser);
      expect(browser._original.requestHandler.sessionID).toBe(sessions[0].id);

      expect(wd.remote.mock.calls.length).toBe(1);
      expect(wd.remote.mock.calls[0][0]).toBe(options);

    });

    it('starts a new session when noSessionReuse is true when a session exists', function () {

      var wd = require('xolvio-sync-webdriverio');
      var SessionManager = require('../lib/session-manager');

      wd.remote = jest.genMockFn().
        mockReturnValueOnce('return from remote1').
        mockReturnValueOnce('return from remote2');
      var sessionManager = new SessionManager({port: 1234, browser: 'something'});

      sessionManager._waitForConnection = jest.genMockFn().mockImpl(function (browser, callback) {
        callback();
      });

      var options = {some: 'options'};
      process.env['chimp.noSessionReuse'] = true;
      var callback = jest.genMockFn();
      sessionManager.remote(options, callback);
      sessionManager.remote(options, callback);

      expect(callback.mock.calls[0][1]).toBe('return from remote1');
      expect(callback.mock.calls[1][1]).toBe('return from remote2');
      expect(callback.mock.calls[1][1].requestHandler).toBeFalsy();
      expect(callback.mock.calls[1][1].requestHandler).toBeFalsy();

      expect(wd.remote.mock.calls.length).toBe(2);
      expect(wd.remote.mock.calls[0][0]).toBe(options);
      expect(wd.remote.mock.calls[1][0]).toBe(options);

    });

    it('respects noSessionReuse in watch mode', function () {

      var wd = require('xolvio-sync-webdriverio');
      var SessionManager = require('../lib/session-manager');

      wd.remote = jest.genMockFn().
        mockReturnValueOnce('return from remote1').
        mockReturnValueOnce('return from remote2');
      var sessionManager = new SessionManager({port: 1234, browser: 'something'});

      sessionManager._waitForConnection = jest.genMockFn().mockImpl(function (browser, callback) {
        callback();
      });

      var options = {some: 'options'};
      process.env['chimp.watch'] = true;
      process.env['chimp.noSessionReuse'] = true;
      var callback = jest.genMockFn();
      sessionManager.remote(options, callback);
      sessionManager.remote(options, callback);

      expect(callback.mock.calls[0][1]).toBe('return from remote1');
      expect(callback.mock.calls[1][1]).toBe('return from remote2');
      expect(callback.mock.calls[0][1].requestHandler).toBeFalsy();
      expect(callback.mock.calls[1][1].requestHandler).toBeFalsy();

      expect(wd.remote.mock.calls.length).toBe(2);
      expect(wd.remote.mock.calls[0][0]).toBe(options);
      expect(wd.remote.mock.calls[1][0]).toBe(options);

    });

    it('should monkey patch the browser when reusing sessions in watch mode', function () {

      var wd = require('xolvio-sync-webdriverio');
      var SessionManager = require('../lib/session-manager');
      var sessionManager = new SessionManager({port: 1234, browser: 'somebrowser'});
      var sessions = [];
      sessionManager._getWebdriverSessions = jest.genMockFn().mockImplementation(function (callback) {
        callback(null, sessions);
      });
      sessionManager._waitForConnection = jest.genMockFn().mockImpl(function (browser, callback) {
        callback();
      });

      wd.remote = jest.genMockFn();
      process.env['chimp.watch'] = true;
      sessionManager._monkeyPatchBrowserSessionManagement = jest.genMockFn();

      var options = {some: 'options'};
      var callback = jest.genMockFn();
      sessionManager.remote(options, callback);

      expect(sessionManager._monkeyPatchBrowserSessionManagement.mock.calls.length).toBe(1);

    });

  });

  describe('_waitForConnection', function () {
    it('calls back when the browser returns a non error response', function () {

      var SessionManager = require('../lib/session-manager');
      var sessionManager = new SessionManager({port: 1234, browser: 'phantomjs'});

      var browser = {
        statusAsync: jest.genMockFn().mockImpl(function (callback) {
          callback(null);
        })
      };

      var callback = jest.genMockFn();
      sessionManager._waitForConnection(browser, callback);

      expect(callback.mock.calls.length).toBe(1);
      expect(typeof callback.mock.calls[0][0]).toBe('undefined');

    });

    it('retries when the browser returns an ECONNREFUSED error response', function () {

      var SessionManager = require('../lib/session-manager');
      var sessionManager = new SessionManager({port: 1234, browser: 'phantomjs'});

      var browser = {
        statusAsync: jest.genMockFn().mockImpl(function (callback) {
          callback({message: 'blah ECONNREFUSED blah'});
        })
      };

      var callback = jest.genMockFn();
      var __waitForConnection = sessionManager._waitForConnection;
      sessionManager._waitForConnection = jest.genMockFn().mockImpl(function () {
        if (sessionManager._waitForConnectionCalled) {
          return;
        }
        sessionManager._waitForConnectionCalled = true;
        __waitForConnection.apply(this, arguments);
      });
      sessionManager._waitForConnection(browser, callback);

      jest.runAllTimers();

      expect(sessionManager._waitForConnection.mock.calls.length).toBe(2);
      expect(callback.mock.calls.length).toBe(0);

    });

    it('returns an error when the max retries is reached', function () {


      var SessionManager = require('../lib/session-manager');
      var sessionManager = new SessionManager({port: 1234, browser: 'phantomjs'});

      var browser = {
        statusAsync: jest.genMockFn().mockImpl(function (callback) {
          callback({message: 'blah ECONNREFUSED blah'});
        })
      };

      var callback = jest.genMockFn();
      sessionManager.retry = 4;
      sessionManager.maxRetries = 5;
      sessionManager._waitForConnection(browser, callback);

      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toBe('[chimp][session-manager] timed out retrying to connect to selenium server');

    })

  });

});
