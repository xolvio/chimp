'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fibers = require('fibers');

var _fibers2 = _interopRequireDefault(_fibers);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

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

  var Jasmine = require('jasmine');
  var jasmine = new Jasmine();

  // Capability to add multiple spec filters
  var specFilters = [];
  jasmine.env.specFilter = function shouldRunSpec(spec) {
    return _underscore2.default.every(specFilters, function (specFilter) {
      return specFilter(spec);
    });
  };

  jasmine.jasmine.addSpecFilter = function addSpecFilter(filterFn) {
    specFilters.push(filterFn);
  };

  if ((0, _environmentVariableParsers.parseBoolean)(process.env['chimp.watch'])) {
    (function () {
      // Only run specs with a watch tag in watch mode
      var watchedSpecRegExp = new RegExp((0, _environmentVariableParsers.parseString)(process.env['chimp.watchTags']).split(',').map(_escapeRegExp2.default).join('|'));
      jasmine.jasmine.addSpecFilter(function (spec) {
        return watchedSpecRegExp.test(spec.getFullName());
      });
    })();
  }

  (0, _jasmineFiberizedApi2.default)(global);

  jasmine.loadConfig(getJasmineConfig());
  jasmine.configureDefaultReporter(JSON.parse(process.env['chimp.jasmineReporterConfig']));
  jasmine.execute();
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