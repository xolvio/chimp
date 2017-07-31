import browser from '../browser';

before(function () {
  return browser.init();
});

after(function () {
  return browser.end();
});

export default browser;
