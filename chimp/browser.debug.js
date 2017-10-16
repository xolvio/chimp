import BrowserFactory from './browser-factory';

const port = 9516;
const host = '127.0.0.1';
const desiredCapabilities = {
  browserName: 'chrome',
  chromeOptions: {
    'args': []
  }
};
export default new BrowserFactory({}).create({port, host, desiredCapabilities});
