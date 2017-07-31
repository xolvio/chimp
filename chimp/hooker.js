module.exports = function (browser) {

  function tryTo(fn) {
    try {
      fn();
      return true;
    } catch (e) {
      return false;
    }
  }

  function installHooks() {
    after(function () {
      return browser.end();
    });
    before(function () {
      return browser.init();
    });
  }

  function installAllHooks() {
    beforeAll(function () {
      return browser.init();
    });
    afterAll(function () {
      return browser.end();
    });
  }

  function installCucumberHooks() {
    const cucumber = require('cucumber');
    cucumber.Before(async function () {
      await browser.init();
    });
    cucumber.After(async function () {
      await browser.end();
    });
  }

  tryTo(installAllHooks) || tryTo(installHooks) || tryTo(installCucumberHooks);
};
