var chimpHelper = require('../chimp-helper');
var exit = require('exit');
var log = require('../log');
const booleanHelper = require('../boolean-helper');
const screenshotHelper = require('../screenshot-helper');

before(function () {
  process.env['chimp.chai'] = true;
  chimpHelper.loadAssertionLibrary();
  chimpHelper.init();
  chimpHelper.setupBrowserAndDDP();
});

after(function () {
  if (process.env['chimp.browser'] !== 'phantomjs') {
    log.debug('[chimp][mocha-helper] Ending browser session');
    global.wrapAsync(global.sessionManager.killCurrentSession, global.sessionManager)();
    log.debug('[chimp][mocha-helper] Ended browser sessions');
  }
});

afterEach(function () {
  if (screenshotHelper.shouldTakeScreenshot(this.currentTest.state)) {
    if (booleanHelper.isTruthy(process.env['chimp.saveScreenshotsToDisk'])) {
      const affix = this.currentTest.state !== 'passed' ? ' (failed)' : '';
      const fileName = this.currentTest.fullTitle() + affix;
      screenshotHelper.saveScreenshotsToDisk(fileName);
    }
  }
});
