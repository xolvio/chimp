#!/usr/bin/env node

var Chimp = require('../lib/chimp.js'),
   minimist = require('minimist'),
   freeport = require('freeport'),
   exit = require('exit'),
   log = require('../lib/log'),
   fs = require('fs'),
   _ = require('underscore'),
   path = require('path'),
   optionsLoader = require('../lib/options-loader');

// Make babel plugins available to Cucumber
process.env.NODE_PATH += ':' + path.resolve(__dirname, '../../node_modules');

var argv = minimist(process.argv, {
  default: optionsLoader.getOptions(),
  boolean: true
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
