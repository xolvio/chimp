import BrowserFactory from './browser-factory';
import loadConfig from './utils/load-config';

const config = loadConfig();

export default new BrowserFactory({}).create(config.webdriverio);
