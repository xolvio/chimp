#!/usr/bin/env node
const packageJson = require('../package.json');
const exec = require('./lib/exec');
const distDir = packageJson.distDir;
const chimpDir = packageJson.chimpDir;

exec(`rm -rf ${process.cwd()}/${distDir}`);
exec(`${process.cwd()}/${chimpDir}/node_modules/.bin/babel ${process.cwd()}/${chimpDir} --ignore *spec,node_modules --out-dir ${process.cwd()}/${distDir} -q`);
exec(`cp ${process.cwd()}/${chimpDir}/package.json ${process.cwd()}/${distDir}`);
