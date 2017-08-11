import BrowserFactory from './browser-base';

const port = 9516;
const desiredCapabilities = {
  browserName: 'chrome',
  chromeOptions: {
    'args': []
  }
};
export default BrowserFactory({port, desiredCapabilities});

