#!/usr/bin/env node

var Chimp = require('../lib/chimp.js'),
  minimist = require('minimist'),
  freeport = require('freeport'),
  exit = require('exit'),
  log = require('../lib/log'),
  fs = require('fs'),
  _ = require('underscore'),
  path = require('path'),
  optionsLoader = require('../lib/options-loader'),
  packageJson = require('../../package.json');

// Make babel plugins available to Cucumber and Mocha child processes
process.env.NODE_PATH += path.delimiter + path.resolve(__dirname, '../../node_modules') +
  path.delimiter + path.resolve(__dirname, '../../../../node_modules');

var argv = minimist(process.argv, {
  default: optionsLoader.getOptions(),
  boolean: [
    // - - - - CHIMP - - - -
    'watch',
    'watchWithPolling',
    'server',
    'sync',
    'offline',

    // - - - - CUCUMBER - - - -
    'singleSnippetPerFile',
    'chai',
    'screenshotsOnError',
    'captureAllStepScreenshots',
    'saveScreenshotsToDisk',
    'saveScreenshotsToReport',

    // - - - - SELENIUM  - - - -

    // - - - - WEBDRIVER-IO  - - - -

    // - - - - SESSION-MANAGER  - - - -
    'noSessionReuse',

    // - - - - SIMIAN  - - - -

    // - - - - MOCHA  - - - -
    'mocha',

    // - - - - METEOR  - - - -

    // - - - - DEBUGGING  - - - -
    'debug',
  ],
});

if (argv.host && ((argv.host.indexOf('sauce') !== -1 || argv.host.indexOf('browserstack') !== -1) || argv.host.indexOf('testingbot') !== -1)) {
  argv.noSessionReuse = true;
}

if (argv.deviceName) {
  argv.browser = '';
}

if (argv.v || argv.version) {
  console.log(packageJson.version);
  process.exit();
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
    startChimp(argv);
  }

} catch (ex) {
  process.stderr.write(ex.stack + '\n');
  exit(2);
}

function startChimp(options) {
  var chimp = new Chimp(options);
  chimp.init(function (err) {
    if (err) {
      log.error(err);
      log.debug('Error in chimp init', err);
    }
    exit(err ? 2 : 0);
  });
}
