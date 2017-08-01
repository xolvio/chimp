import browser from '../browser';

afterAll(function () {
  return browser.end();
});

beforeAll(function () {
  return browser.init();
});

export default browser;
