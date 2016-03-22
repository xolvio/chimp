require('../babel-register');

import path from 'path';
import Fiber from 'fibers';

new Fiber(function runJasmineInFiber() {
  const Jasmine = require('jasmine');
  const jasmine = new Jasmine();

  const testsDir = process.env['chimp.path'];
  jasmine.loadConfig({
    spec_dir: testsDir,
    spec_files: [
      '**/*.@(js|jsx)',
      '!support/**/*.@(js|jsx)',
    ],
    helpers: [
      path.relative(testsDir, path.resolve(__dirname, 'jasmine-helpers.js')),
      'support/**/*.@(js|jsx)',
    ],
  });
  jasmine.configureDefaultReporter({
    showColors: true,
  });
  jasmine.execute();
}).run();
