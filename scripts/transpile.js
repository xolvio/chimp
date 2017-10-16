#!/usr/bin/env node
const packageJson = require('../package.json');
const exec = require('./lib/exec');
const distDir = packageJson.distDir;
const chimpDir = packageJson.chimpDir;

exec(`${process.cwd()}/node_modules/.bin/babel ${process.cwd()}/${chimpDir} --ignore wallaby.js,*spec,node_modules --source-maps inline --out-dir ${process.cwd()}/${distDir} -q`);
exec(`cp ${process.cwd()}/${chimpDir}/package.json ${process.cwd()}/${distDir}`);
