import browser from '../browser.debug';
import {beforeHook, afterHook} from '../hooks';
import {Before, After} from 'cucumber';

Before(beforeHook(browser, __filename));

After(afterHook(browser));

export default browser;
