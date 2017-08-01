import browser from '../browser';
import {Before, After} from 'cucumber';

Before(async function () {
  await browser.init();
});

After(async function () {
  await browser.end();
});

export default browser;
