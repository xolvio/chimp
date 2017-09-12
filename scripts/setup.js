#!/usr/bin/env node
const packageJson = require('../package.json');
const exec = require('./lib/exec');

// exec(`npm run clean`);
// exec(`npm i`);
// exec(`cd ${process.cwd()}/${packageJson.chimpDir} && npm i`);
// exec(`npm run transpile`);
// exec(`cd ${process.cwd()}/${packageJson.testProjectDir} && npm i`);
// exec(`npm run link`);
exec(`npm test`);
