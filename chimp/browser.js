const webdriverio = require('webdriverio');
const chromedriver = require('chromedriver');

const port = 9515;
const args = [
  '--url-base=wd/hub',
  `--port=${port}`
];
chromedriver.start(args);

const options = {
  port,
  desiredCapabilities: {
    browserName: 'chrome',
    "chromeOptions": {
      "args": [
        "--headless"
      ]
    }
  }
};

const browser = webdriverio.remote(options);

export default browser;
