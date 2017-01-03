import chimpHelper from '../chimp-helper';
import log from '../log';
import runHook from '../utils/run-hook';

beforeAll(function chimpSetup() {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
  chimpHelper.init();
  chimpHelper.setupBrowserAndDDP();
  runHook('webdriverio', 'setup', browser);
});

afterAll(function chimpTeardown() {
  if (process.env['chimp.browser'] !== 'phantomjs') {
    log.debug('[chimp][jasmine-helpers] Ending browser session');
    global.wrapAsync(global.sessionManager.killCurrentSession, global.sessionManager)();
    log.debug('[chimp][jasmine-helpers] Ended browser sessions');
  }

  runHook('webdriverio', 'teardown', browser);
});
