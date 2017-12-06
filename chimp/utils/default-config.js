export default {
  chimp: {},
  webdriverio: {
    // If set to true, skip internal chromedriver/selenium service setup.
    externalHub: false,
    webdriverHubImpl: 'chromedriver',
    port: 9515,
    host: '127.0.0.1',
    desiredCapabilities: {
      browserName: 'chrome',
      chromeOptions: {
        args: ['--headless']
      }
    }
  },
  meteor: {}
};
