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

    it('throws when options is not passed', function () {
      var SessionManager = require('../lib/session-manager');
      var createSessionManager = function () {
        new SessionManager();
      };
      expect(createSessionManager).toThrow('options is required');
    });

    it('throws when options.port is not passed', function () {
      var SessionManager = require('../lib/session-manager');
      var options = {};
      var createSessionManager = function () {
        new SessionManager({});
      };
      expect(createSessionManager).toThrow('options.port is required');
    });

    it('throws when options.browser is not passed', function () {
      var SessionManager = require('../lib/session-manager');
      var options = {port: 1234};
      var createSessionManager = function () {
        new SessionManager(options);
      };
      expect(createSessionManager).toThrow('options.browser is required');
    });

  });

  describe('Remote', function () {

    beforeEach(function () {
      delete process.env['no-session-reuse'];
    });

    it('should delegate the webdriver remote call if using phantom', function () {

      var wd = require('webdriverio');
      var SessionManager = require('../lib/session-manager');

      wd.remote = jest.genMockFn().
        mockReturnValueOnce('return from remote1').
        mockReturnValueOnce('return from remote2');
      var sessionManager = new SessionManager({port: 1234, browser: 'phantomjs'});

      var sessions = [1234];
      sessionManager._getWebdriverSessions = jest.genMockFn().mockImpl(function (callback) {
        callback(sessions);
      });

      var options = {some: 'options'};

      var browser1 = sessionManager.remote(options);
      var browser2 = sessionManager.remote(options);


      expect(wd.remote.mock.calls.length).toBe(2);
      expect(browser1).toBe('return from remote1');
      expect(browser2).toBe('return from remote2');
      expect(wd.remote.mock.calls[0][0]).toBe(options);
      expect(wd.remote.mock.calls[1][0]).toBe(options);

    });

    it('should delegate the webdriver remote call if a session has not already started', function () {

      var wd = require('webdriverio');
      var SessionManager = require('../lib/session-manager');

      wd.remote = jest.genMockFn().mockReturnValue('return from remote');

      var sessionManager = new SessionManager({port: 1234, browser: 'something'});

      var sessions = [];
      sessionManager._getWebdriverSessions = jest.genMockFn().mockReturnValue(sessions);

      var options = {some: 'options'};
      var callback = jest.genMockFn();

      var browser = sessionManager.remote(options);

      expect(browser).toBe('return from remote');

      expect(wd.remote.mock.calls.length).toBe(1);
      expect(wd.remote.mock.calls[0][0]).toBe(options);

    });

    it('should reuse a session if one has already started', function () {

      var wd = require('webdriverio');
      var SessionManager = require('../lib/session-manager');

      var browser = {requestHandler : {sessionID : 'some-id'}};
      wd.remote = jest.genMockFn().mockReturnValue(browser);

      var sessionManager = new SessionManager({port: 1234, browser: 'something'});

      var sessions = [{id: 'session-id'}];
      sessionManager._getWebdriverSessions = jest.genMockFn().mockReturnValue(sessions);

      var options = {some: 'options'};
      var result = sessionManager.remote(options);

      expect(result).toBe(browser);

      expect(wd.remote.mock.calls.length).toBe(1);
      expect(wd.remote.mock.calls[0][0]).toBe(options);
      expect(browser.requestHandler.sessionID).toBe(sessions[0].id);

    });

    it('starts a new session when no-session-reuse is true when a session exists', function () {

      var wd = require('webdriverio');
      var SessionManager = require('../lib/session-manager');

      wd.remote = jest.genMockFn().
        mockReturnValueOnce('return from remote1').
        mockReturnValueOnce('return from remote2');
      var sessionManager = new SessionManager({port: 1234, browser: 'something'});

      var options = {some: 'options'};
      process.env['no-session-reuse'] = true;
      var browser1 = sessionManager.remote(options);
      var browser2 = sessionManager.remote(options);


      expect(browser1).toBe('return from remote1');
      expect(browser2).toBe('return from remote2');

      expect(wd.remote.mock.calls.length).toBe(2);
      expect(wd.remote.mock.calls[0][0]).toBe(options);
      expect(wd.remote.mock.calls[1][0]).toBe(options);
      expect(browser1.requestHandler).toBeFalsy();
      expect(browser2.requestHandler).toBeFalsy(null);

    });

    it('should monkey patch the browser when reusing sessions', function () {


      var wd = require('webdriverio');
      var SessionManager = require('../lib/session-manager');
      var sessionManager = new SessionManager({port: 1234, browser: 'somebrowser'});
      var sessions = [];
      sessionManager._getWebdriverSessions = jest.genMockFn().mockReturnValue(sessions);
      wd.remote = jest.genMockFn();

      sessionManager._monkeyPatchBrowserSessionManagement = jest.genMockFn();

      var options = {some: 'options'};
      sessionManager.remote(options);

      expect(sessionManager._monkeyPatchBrowserSessionManagement.mock.calls.length).toBe(1);

    });

  });

});
