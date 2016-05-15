require('../babel-register');

var Mocha = require('mocha'),
    fs    = require('fs'),
    path  = require('path'),
    exit  = require('exit'),
    glob  = require('glob'),
    ui    = require('./mocha-fiberized-ui');

import {parseBoolean, parseString } from '../environment-variable-parsers';
import escapeRegExp from '../utils/escape-reg-exp';
import runHook from '../utils/run-hook';

var mochaOptions = {
  ui: 'fiberized-bdd-ui',
  timeout: process.env['chimp.mochaTimeout'],
  slow: process.env['chimp.mochaSlow'],
  reporter: process.env['chimp.mochaReporter']
};

if (parseBoolean(process.env['chimp.watch'])) {
  mochaOptions.grep = new RegExp(
    parseString(process.env['chimp.watchTags']).split(',').map(escapeRegExp).join('|')
  );
}

var mocha = new Mocha(mochaOptions);

mocha.addFile(path.join(path.resolve(__dirname, path.join('mocha-helper.js'))));

// Add each .js file to the mocha instance
var testDir = process.env['chimp.path'];
glob.sync(path.join(testDir, '**')).filter(function (file) {
  // Only keep the .js files
  return file.substr(-3) === '.js';
}).forEach(function (file) {
  mocha.addFile(file);
});

try {
  runHook('mocha', 'setup', mocha);

  // Run the tests.
  mocha.run(function (failures) {
    runHook('mocha', 'teardown', mocha);
    exit(failures);
  });
} catch (e) {
  throw(e);
}

