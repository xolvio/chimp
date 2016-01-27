jest.dontMock('../lib/browserstack-manager');

describe('BrowserStack Session Manager', function () {

  describe('Constructor', function () {

    it('sets the browserStackUrl', function () {
      var BrowserStackManager = require('../lib/browserstack-manager');
      var options = {port: 1234, browser: 'something', user: 'testus3r', key: '12345678', host: 'browserstack.com'};

      var browserStackBaseUrl = 'https://' + options.user + ':' + options.key + '@' + options.host;

      var session = new BrowserStackManager(options);

      expect(session.options.browserStackUrl).toBe(browserStackBaseUrl);
    });

  });

});
