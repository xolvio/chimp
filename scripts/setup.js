#!/usr/bin/env node
const packageJson = require('../package.json');
const exec = require('./lib/exec');
exec(`cd ${process.cwd()}/${packageJson.chimpDir} && npm i`);
exec(`npm run transpile`);
exec(`cd ${process.cwd()}/${packageJson.distDir} && npm link`);
exec(`cd ${process.cwd()}/${packageJson.testProjectDir} && npm i`);
exec(`cd ${process.cwd()}/${packageJson.testProjectDir} && npm link chimp`);
exec(`npm test`);
