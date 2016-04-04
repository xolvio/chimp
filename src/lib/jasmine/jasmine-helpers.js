import chimpHelper from '../chimp-helper';
import log from '../log';

beforeAll(function chimpSetup() {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
  chimpHelper.init();
  chimpHelper.setupBrowserAndDDP();
});

afterAll(function chimpTeardown() {
  if (process.env['chimp.browser'] !== 'phantomjs') {
    log.debug('[chimp][jasmine-helpers] Ending browser session');
    global.wrapAsync(global.sessionManager.killCurrentSession, global.sessionManager)();
    log.debug('[chimp][jasmine-helpers] Ended browser sessions');
  }
});
