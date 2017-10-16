import {beforeHook, afterHook} from './hooks'

describe('Hooks', function () {
  describe('beforeHook', function () {
    it('should prevent node from caching the provided filename module', async function () {
      const browser = {init: td.function()};
      td.when(browser.init()).thenResolve();
      require.cache['some/module/file.js'] = "cached item";

      beforeHook(browser, 'some/module/file.js')();

      expect(require.cache['some/module/file.js']).to.equal(undefined);
    });
    it('should init the browser session', function () {
      const browser = {init: td.function()};
      td.when(browser.init()).thenResolve();

      beforeHook(browser)();

      td.verify(browser.init());
    });
  });
  describe('afterHook', function () {
    it('should end the browser session', function () {
      const browser = {end: td.function()};
      td.when(browser.end()).thenResolve();

      afterHook(browser)();

      td.verify(browser.end());
    });
  });
});