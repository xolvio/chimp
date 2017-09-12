#!/usr/bin/env node
const packageJson = require('../package.json');
const exec = require('./lib/exec');

exec(`cd ${process.cwd()}/${packageJson.testProjectDir} && npm test`);
