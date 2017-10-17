import browser from '../browser';
import {beforeHook, afterHook} from '../hooks';
import test from 'ava';

test.before(beforeHook(browser, __filename));

test.after(afterHook(browser));

export default browser;
