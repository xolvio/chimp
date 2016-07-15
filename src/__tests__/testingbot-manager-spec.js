jest.dontMock('../lib/testingbot-manager');

describe('TestingBot Session Manager', function () {

  describe('Constructor', function () {

    it('sets the TestingBotUrl', function () {
      var TestingBotManager = require('../lib/testingbot-manager');
      var options = {port: 1234, browser: 'something', user: 'testus3r', key: '12345678', host: 'api.testingbot.com'};

      var testingBotBaseUrl = 'https://' + options.user + ':' + options.key + '@' + options.host + '/v1/';

      var session = new TestingBotManager(options);

      expect(session.options.testingbotBaseUrl).toBe(testingBotBaseUrl);
    });

  });

});
