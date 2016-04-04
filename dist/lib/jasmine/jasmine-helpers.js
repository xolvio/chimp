'use strict';

var _chimpHelper = require('../chimp-helper');

var _chimpHelper2 = _interopRequireDefault(_chimpHelper);

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

beforeAll(function chimpSetup() {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
  _chimpHelper2.default.init();
  _chimpHelper2.default.setupBrowserAndDDP();
});

afterAll(function chimpTeardown() {
  if (process.env['chimp.browser'] !== 'phantomjs') {
    _log2.default.debug('[chimp][jasmine-helpers] Ending browser session');
    global.wrapAsync(global.sessionManager.killCurrentSession, global.sessionManager)();
    _log2.default.debug('[chimp][jasmine-helpers] Ended browser sessions');
  }
});