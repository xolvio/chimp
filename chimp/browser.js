import BrowserFactory from './browser-factory';

const port = 9515;
const host = '127.0.0.1';
const desiredCapabilities = {
  browserName: 'chrome',
  chromeOptions: {
    'args': ['--headless']
  }
};
export default new BrowserFactory({}).create({port, host, desiredCapabilities});
