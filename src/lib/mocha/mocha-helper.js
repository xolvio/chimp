var chimpHelper = require('../chimp-helper');
var exit = require('exit');
var log = require('../log');
import runHook from '../utils/run-hook';

before(function () {
  process.env['chimp.chai'] = true;
  chimpHelper.loadAssertionLibrary();
  chimpHelper.init();
  chimpHelper.setupBrowserAndDDP();
  runHook('webdriverio', 'setup', browser);
});

after(function () {
  if (process.env['chimp.browser'] !== 'phantomjs') {
    log.debug('[chimp][mocha-helper] Ending browser session');
    global.wrapAsync(global.sessionManager.killCurrentSession, global.sessionManager)();
    log.debug('[chimp][mocha-helper] Ended browser sessions');
  }

  runHook('webdriverio', 'teardown', browser);
});
