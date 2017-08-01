#!/usr/bin/env node
const packageJson = require('../package.json');
const exec = require('./lib/exec');
const distDir = packageJson.distDir;
const testProjectDir = packageJson.testProjectDir;

exec(`cd ${process.cwd()}/${distDir} && npm link`);
exec(`cd ${process.cwd()}/${testProjectDir} && npm link chimp`);
