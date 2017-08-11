export function beforeHook(browser, filename) {
  return async function () {
    delete require.cache[filename];
    await browser.init();
  };
}

export function afterHook(browser) {
  return async function () {
    await browser.end();
  };
}
