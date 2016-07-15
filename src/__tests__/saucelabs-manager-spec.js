jest.dontMock('../lib/saucelabs-manager');

describe('SauceLabs Session Manager', function () {

  describe('Constructor', function () {

    it('sets the SauceLabsUrl', function () {
      var SauceLabsManager = require('../lib/saucelabs-manager');
      var options = {port: 1234, browser: 'something', user: 'testus3r', key: '12345678', host: 'saucelabs.com'};

      var sauceLabsBaseUrl = 'https://' + options.user + ':' + options.key + '@' + options.host + '/rest/v1/' + options.user;

      var session = new SauceLabsManager(options);

      expect(session.options.sauceLabsUrl).toBe(sauceLabsBaseUrl);
    });

  });

});
