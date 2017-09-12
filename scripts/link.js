#!/usr/bin/env node
const packageJson = require('../package.json');
const exec = require('./lib/exec');

exec(`cd ${process.cwd()}/${packageJson.distDir} && npm link`);
exec(`cd ${process.cwd()}/${packageJson.testProjectDir} && npm link chimp`);
