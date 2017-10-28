#!/usr/bin/env node
const packageJson = require('../package.json');
const exec = require('./lib/exec');

const chimpTestsResultCode = exec(`cd ${process.cwd()}/${packageJson.chimpDir} && npm test`).code;
const testProjectTestsResultCode = exec(`cd ${process.cwd()}/${packageJson.testProjectDir} && npm test`).code;
if (chimpTestsResultCode === 0 && testProjectTestsResultCode === 0) {
  process.exit(chimpTestsResultCode);
} else {
  process.exit(1);
}