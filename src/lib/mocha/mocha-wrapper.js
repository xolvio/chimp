require('../babel-register');

var Mocha = require('mocha'),
    fs    = require('fs'),
    path  = require('path'),
    exit  = require('exit'),
    glob  = require('glob'),
    ui    = require('./mocha-fiberized-ui'),
    booleanHelper = require('../boolean-helper');

var mochaOptions = {
  ui: 'fiberized-bdd-ui',
  timeout: process.env['chimp.mochaTimeout'],
  slow: process.env['chimp.mochaSlow'],
  reporter: process.env['chimp.mochaReporter']
};

if (booleanHelper.isTruthy(process.env['chimp.watch'])) {
  mochaOptions.grep = new RegExp(process.env['chimp.watchTags'].replace(/,/g, '|'));
}

var mocha = new Mocha(mochaOptions);

mocha.addFile(path.join(path.resolve(__dirname, path.join('mocha-helper.js'))));

var customMochaHelperPath = path.resolve(process.cwd(), process.env['chimp.path'], 'mocha-helper.js');

if (fs.existsSync(customMochaHelperPath)) {
  mocha.addFile(customMochaHelperPath);
}

// Add each .js file to the mocha instance
var testDir = process.env['chimp.path'];
glob.sync(path.join(testDir, '**')).filter(function (file) {
  // Only keep the .js files
  return file.substr(-3) === '.js';
}).forEach(function (file) {
  mocha.addFile(file);
});

try {
// Run the tests.
  mocha.run(function (failures) {
    exit(failures);
  });
} catch (e) {
  throw(e);
}

