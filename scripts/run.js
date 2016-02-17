#!/usr/bin/env node

var exec = require('./lib/exec');

exec('npm run prepublish');
exec('node ./bin/chimp.js');
