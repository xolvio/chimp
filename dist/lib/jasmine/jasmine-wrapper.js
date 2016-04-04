'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fibers = require('fibers');

var _fibers2 = _interopRequireDefault(_fibers);

var _environmentVariableParsers = require('../environment-variable-parsers');

var _escapeRegExp = require('../utils/escape-reg-exp');

var _escapeRegExp2 = _interopRequireDefault(_escapeRegExp);

var _jasmineFiberizedApi = require('./jasmine-fiberized-api');

var _jasmineFiberizedApi2 = _interopRequireDefault(_jasmineFiberizedApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('../babel-register');

new _fibers2.default(function runJasmineInFiber() {
  var testsDir = process.env['chimp.path'];
  process.chdir(testsDir);

  var specFilter = '';
  if ((0, _environmentVariableParsers.parseBoolean)(process.env['chimp.watch'])) {
    // Only run specs with a watch tag in watch mode
    specFilter = (0, _environmentVariableParsers.parseString)(process.env['chimp.watchTags']).split(',').map(_escapeRegExp2.default).join('|');
  }

  var Jasmine = require('jasmine');
  var jasmine = new Jasmine();
  (0, _jasmineFiberizedApi2.default)(global);

  jasmine.loadConfig(getJasmineConfig());
  jasmine.configureDefaultReporter(JSON.parse(process.env['chimp.jasmineReporterConfig']));
  jasmine.execute(null, specFilter);
}).run();

function getJasmineConfig() {
  var jasmineConfig = JSON.parse(process.env['chimp.jasmineConfig']);

  if (jasmineConfig.specDir) {
    if (!jasmineConfig.spec_dir) {
      jasmineConfig.spec_dir = jasmineConfig.specDir;
    }
    delete jasmineConfig.specDir;
  }

  if (jasmineConfig.specFiles) {
    if (!jasmineConfig.spec_files) {
      jasmineConfig.spec_files = jasmineConfig.specFiles;
    }
    delete jasmineConfig.specFiles;
  }

  if (!jasmineConfig.helpers) {
    jasmineConfig.helpers = [];
  }
  jasmineConfig.helpers.unshift(_path2.default.relative(jasmineConfig.spec_dir, _path2.default.resolve(__dirname, 'jasmine-helpers.js')));

  return jasmineConfig;
}