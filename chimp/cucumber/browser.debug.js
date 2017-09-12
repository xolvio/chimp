import browser from '../browser.debug';
import {beforeHook, afterHook} from '../hooks';
import {setDefaultTimeout, Before, After} from 'cucumber';

setDefaultTimeout(24 * 60 * 60 * 1000);

Before(beforeHook(browser, __filename));

After(afterHook(browser));

export default browser;
