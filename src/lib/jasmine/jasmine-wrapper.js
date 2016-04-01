require('../babel-register');

import path from 'path';
import Fiber from 'fibers';
import {parseBoolean, parseString } from '../environment-variable-parsers';
import escapeRegExp from '../utils/escape-reg-exp';

new Fiber(function runJasmineInFiber() {
  const testsDir = process.env['chimp.path'];
  process.chdir(testsDir);

  let specFilter = '';
  if (parseBoolean(process.env['chimp.watch'])) {
    // Only run specs with a watch tag in watch mode
    specFilter = parseString(process.env['chimp.watchTags']).split(',').map(escapeRegExp).join('|');
  }

  const Jasmine = require('jasmine');
  const jasmine = new Jasmine();

  jasmine.loadConfig(getJasmineConfig());
  jasmine.configureDefaultReporter(
    JSON.parse(process.env['chimp.jasmineReporterConfig'])
  );
  jasmine.execute(null, specFilter);
}).run();


function getJasmineConfig() {
  const jasmineConfig = JSON.parse(process.env['chimp.jasmineConfig']);

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
  jasmineConfig.helpers.unshift(
    path.relative(jasmineConfig.spec_dir, path.resolve(__dirname, 'jasmine-helpers.js'))
  );

  return jasmineConfig;
}
