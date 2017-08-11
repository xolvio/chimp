import browser from '../browser.debug';
import {beforeHook, afterHook} from '../hooks';

beforeAll(beforeHook(browser, __filename));
afterAll(afterHook(browser));

export default browser;
