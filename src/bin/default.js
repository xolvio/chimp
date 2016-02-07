import path from 'path';

module.exports = {
  // - - - - CHIMP - - - -
  watch: false,
  watchTags: '@dev,@watch,@focus',
  watchWithPolling: false,
  criticalSteps: false,
  criticalTag: '@critical',
  server: false,
  serverPort: 8060,
  serverHost: 'localhost',
  sync: true,
  offline: false,

  // - - - - CUCUMBER - - - -
  path: './features',
  snippets: true,
  format: 'pretty',
  tags: '~@ignore',
  singleSnippetPerFile: true,
  recommendedFilenameSeparator: '_',
  chai: false,
  progress: false,
  strict: false,
  coffee: false,
  screenshotsOnError: false,
  screenshotsPath: '.screenshots',
  captureAllStepScreenshots: true,
  saveScreenshotsToDisk: false,
  saveScreenshotsToReport: true,
  jsonOutput: false,
  compiler: 'js:' + path.resolve(__dirname, '../lib/babel-register.js'),

  // - - - - SELENIUM  - - - -
  browser: 'chrome',
  platform: 'ANY',
  name: '',
  user: '',
  key: '',
  port: false,
  host: false,
  deviceName: false,

  // - - - - WEBDRIVER-IO  - - - -
  baseUrl: false,
  timeoutsAsyncScript: 10000,
  timeoutsImplicitWait: 3000,
  waitForTimeout: 10000,
  chromeBin: false,
  chromeArgs: false,
  chromeNoSandbox: false,

  // - - - - SESSION-MANAGER  - - - -
  noSessionReuse: false,
  browserstackLocal: false,
  tunnelIdentifier: false,

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

  // - - - - METEOR  - - - -
  ddp: false,

  // - - - - PHANTOM  - - - -
  phantom_w: 1280,
  phantom_h: 1024,

  // - - - - DEBUGGING  - - - -
  log: 'info',
  debug: false,
  seleniumDebug: false,
  webdriverLogLevel: false,
  debugCucumber: false,
  debugBrkCucumber: false,
  debugMocha: false,
  debugBrkMocha: false,
};
