#!/usr/bin/env node

require('shelljs/global');
var exec = require('./lib/exec');

echo('> Transpiling ES2015');
exec('./node_modules/.bin/babel src --ignore spec --out-dir ./dist -q');
echo('> Completed transpiling ES2015');
