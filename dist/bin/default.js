'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  // - - - - CHIMP - - - -
  watch: false,
  watchTags: '@dev,@watch,@focus',
  watchWithPolling: false,
  criticalSteps: null,
  criticalTag: '@critical',
  server: false,
  serverPort: 8060,
  serverHost: 'localhost',
  sync: true,
  offline: false,

  // - - - - CUCUMBER - - - -
  path: './features',
  format: 'pretty',
  tags: '~@ignore',
  singleSnippetPerFile: true,
  recommendedFilenameSeparator: '_',
  chai: false,
  screenshotsOnError: false,
  screenshotsPath: '.screenshots',
  captureAllStepScreenshots: true,
  saveScreenshotsToDisk: false,
  saveScreenshotsToReport: true,
  jsonOutput: null,
  compiler: 'js:' + _path2.default.resolve(__dirname, '../lib/babel-register.js'),

  // - - - - SELENIUM  - - - -
  browser: 'chrome',
  platform: 'ANY',
  name: '',
  user: '',
  key: '',
  port: null,
  host: null,
  deviceName: null,

  // - - - - WEBDRIVER-IO  - - - -
  baseUrl: null,
  timeoutsAsyncScript: 10000,
  timeoutsImplicitWait: 3000,
  waitForTimeout: 10000,
  chromeBin: null,
  chromeArgs: null,
  chromeNoSandbox: false,

  // - - - - SESSION-MANAGER  - - - -
  noSessionReuse: false,
  browserstackLocal: false,
  tunnelIdentifier: null,

  // - - - - SIMIAN  - - - -
  simianResultEndPoint: 'api.simian.io/v1.0/result',
  simianAccessToken: false,
  simianResultBranch: null,
  simianRepositoryId: null,

  // - - - - MOCHA  - - - -
  mocha: false,
  // 'path: './tests',
  mochaTimeout: 60000,
  mochaReporter: 'spec',
  mochaSlow: 10000,

  // - - - - JASMINE  - - - -
  jasmine: false,

  // - - - - METEOR  - - - -
  ddp: false,

  // - - - - PHANTOM  - - - -
  phantom_w: 1280,
  phantom_h: 1024,

  // - - - - DEBUGGING  - - - -
  log: 'info',
  debug: false,
  seleniumDebug: null,
  webdriverLogLevel: null,
  debugCucumber: null,
  debugBrkCucumber: null,
  debugMocha: null,
  debugBrkMocha: null
};