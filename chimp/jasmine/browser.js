import browser from '../browser';
import {beforeHook, afterHook} from '../hooks';

beforeAll(beforeHook(browser, __filename));
afterAll(afterHook(browser));

export default browser;
