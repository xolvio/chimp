#!/usr/bin/env node
const exec = require('./lib/exec');
exec('rm -rf ./dist');
exec('./node_modules/.bin/babel . --ignore *spec,node_modules --out-dir ./dist -q');
