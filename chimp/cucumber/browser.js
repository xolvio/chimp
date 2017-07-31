import {Before, After} from 'cucumber';
import browser from '../browser';

Before(async function () {
  await browser.init();
});

After(async function() {
  await browser.end();
});

export default browser;
