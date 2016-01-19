#!/usr/bin/env node
var Chimp    = require('../lib/chimp.js'),
    minimist = require('minimist'),
    freeport = require('freeport'),
    exit     = require('exit'),
    log      = require('../lib/log');

var argv = minimist(process.argv, {
  'default': {
    'browser': 'chrome',
    'platform': 'ANY',
    'name': '',
    'debug': false,
    'path': 'features',
    'user': '',
    'key': '',
    'log': 'info',
    'snippets': true,
    'format': 'pretty',
    'tags': '~@ignore',
    'watchTags': '@dev,@watch,@focus',
    'criticalTag': '@critical',
    'criticalSteps': false,
    'watchWithPolling': false,
    'timeoutsAsyncScript': 10000,
    'timeoutsImplicitWait': 3000,
    'waitForTimeout': 10000,
    'screenshotsOnError': false,
    'screenshotsPath': '.',
    'captureAllStepScreenshots': false,
    'attachScreenshotsToReport': false,
    'serverHost': 'localhost',
    'server': false,
    'noSessionReuse': false,
    'simianResultEndPoint': 'api.simian.io/v1.0/result',
    'simianAccessToken': false,
    'simianResultBranch': null,
    'simianRepositoryId': null,
    'sync': true,
    'mochaTimeout': 60000,
    'mochaReporter': 'spec',
    'mochaSlow' : 10000,
    'singleSnippetPerFile' : 0,
    'recommendedFilenameSeparator': ' '
  },
  'boolean': true
});

if (argv.host && (argv.host.indexOf('sauce') !== -1 || argv.host.indexOf('browserstack') !== -1)) {
  argv.noSessionReuse = true;
}

if (argv.deviceName) {
  argv.browser = '';
}

try {
  if (!argv.port) {
    freeport(function (error, port) {
      if (error) {
        throw error;
      }
      argv.port = port;
      startChimp(argv);
    });
  } else {
    startChimp(argv)
  }

} catch (ex) {
  process.stderr.write(ex.stack + '\n');
  exit(2);
}

function startChimp (options) {
  var chimp = new Chimp(options);
  chimp.init(function (err) {
    if (err) {
      log.error(err);
      log.debug('Error in chimp init', err);
    }
    exit(err ? 2 : 0);
  });
}
