import browser from '../browser';

beforeAll(function () {
  return browser.init();
});

afterAll(function () {
  return browser.end();
});

export default browser;
