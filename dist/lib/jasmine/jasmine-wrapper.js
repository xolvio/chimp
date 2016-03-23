'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fibers = require('fibers');

var _fibers2 = _interopRequireDefault(_fibers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('../babel-register');

new _fibers2.default(function runJasmineInFiber() {
  var Jasmine = require('jasmine');
  var jasmine = new Jasmine();

  var testsDir = process.env['chimp.path'];
  jasmine.loadConfig({
    spec_dir: testsDir,
    spec_files: ['**/*.@(js|jsx)', '!support/**/*.@(js|jsx)'],
    helpers: [_path2.default.relative(testsDir, _path2.default.resolve(__dirname, 'jasmine-helpers.js')), 'support/**/*.@(js|jsx)']
  });
  jasmine.configureDefaultReporter({
    showColors: true
  });
  jasmine.execute();
}).run();