import browser from '../browser';

after(function () {
  return browser.end();
});
before(function () {
  return browser.init();
});

export default browser;
