'use strict';

var _environmentVariableParsers = require('../environment-variable-parsers');

var _escapeRegExp = require('../utils/escape-reg-exp');

var _escapeRegExp2 = _interopRequireDefault(_escapeRegExp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('../babel-register');

var Mocha = require('mocha'),
    fs = require('fs'),
    path = require('path'),
    exit = require('exit'),
    glob = require('glob'),
    ui = require('./mocha-fiberized-ui');

var mochaOptions = {
  ui: 'fiberized-bdd-ui',
  timeout: process.env['chimp.mochaTimeout'],
  slow: process.env['chimp.mochaSlow'],
  reporter: process.env['chimp.mochaReporter']
};

if ((0, _environmentVariableParsers.parseBoolean)(process.env['chimp.watch'])) {
  mochaOptions.grep = new RegExp((0, _environmentVariableParsers.parseString)(process.env['chimp.watchTags']).split(',').map(_escapeRegExp2.default).join('|'));
} else {
  mochaOptions.grep = new RegExp((0, _environmentVariableParsers.parseString)(process.env['chimp.mochaTags']).split(',').map(_escapeRegExp2.default).join('|'));
}

var mocha = new Mocha(mochaOptions);

mocha.addFile(path.join(path.resolve(__dirname, path.join('mocha-helper.js'))));

if (process.argv.length > 3) {
  process.argv.splice(3).forEach(function (spec) {
    mocha.addFile(spec);
  });
} else {
  // Add each .js file to the mocha instance
  var testDir = process.env['chimp.path'];
  glob.sync(path.join(testDir, '**')).filter(function (file) {
    // Only keep the .js files
    return file.substr(-3) === '.js';
  }).forEach(function (file) {
    mocha.addFile(file);
  });
}

try {
  // Run the tests.
  mocha.run(function (failures) {
    exit(failures);
  });
} catch (e) {
  throw e;
}