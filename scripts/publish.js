#!/usr/bin/env node
const packageJson = require('../package.json');
const exec = require('./lib/exec');

exec(`rm -rf ${packageJson.distDir}`);
exec(`npm run transpile`);
exec(`cd ${process.cwd()}/${packageJson.distDir} && npm publish --tag next`);
