import browser from '../browser.debug';
import {beforeHook, afterHook} from '../hooks';
import test from 'ava';

setDefaultTimeout(24 * 60 * 60 * 1000);

test.before(beforeHook(browser, __filename));

test.after(afterHook(browser));

export default browser;
