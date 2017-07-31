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

// detect runner and load supporting lib
// or import browser from chimp/cucumber-browser
// import {defineSupportCode} from 'cucumber'
// defineSupportCode(({registerHandler}) => {
//   registerHandler('AfterFeatures', function() {})
// })

// or import server from chimp-cucumber-meteor
// do some patch work



// chimp init
// generate a boiler plate test stack
// wallaby config


// sample tests etc
