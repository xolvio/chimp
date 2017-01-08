require('../babel-register');

var Mocha = require('mocha'),
  fs = require('fs'),
  path = require('path'),
  exit = require('exit'),
  glob = require('glob'),
  ui = require('./mocha-fiberized-ui');

import {parseBoolean, parseNullableString, parseString} from '../environment-variable-parsers';
import escapeRegExp from '../utils/escape-reg-exp';

class MochaWrapper {
  constructor() {
    let mochaConfig = JSON.parse(process.env.mochaConfig);
    mochaConfig.ui = 'fiberized-bdd-ui';

    if (!mochaConfig.grep && parseBoolean(process.env['chimp.watch'])) {
      mochaConfig.grep = new RegExp(parseString(process.env['chimp.watchTags']).split(',').map(escapeRegExp).join('|'));
    } else if (!mochaConfig.grep) {
      mochaConfig.grep = new RegExp(
       parseString(mochaConfig.tags).split(',').map(escapeRegExp).join('|')
      );
    }

    var mocha = new Mocha(mochaConfig);

    console.log('---mocha adding file 0: ', path.join(path.resolve(__dirname, path.join('mocha-helper.js'))));
    mocha.addFile(path.join(path.resolve(__dirname, path.join('mocha-helper.js'))));
    console.log('--process.argv=', process.argv);
    if (process.argv.length > 3) {
      process.argv.splice(3).forEach(function (spec) {
        console.log('---mocha adding file argv:', spec);
        mocha.addFile(spec);
      });
    } else {
      // Add each .js file in the tests dir to the mocha instance
      var testDir = process.env['chimp.path'];
      console.log('--glob.sync (first) path.join(testDir, "**"))=', glob.sync(path.join(testDir, '**')));
      glob.sync(path.join(testDir, '**')).filter(function (file) {
        // Only keep the .js files
        return file.substr(-3) === '.js';
      }).forEach(function (file) {
        console.log('--mocha adding file --path:', file);
        mocha.addFile(file);
      });

      if (process.env['chimp.files']) {
        // Add each file specified by the "files" option to the mocha instance
        glob.sync(process.env['chimp.files']).forEach(function (file) {
          mocha.addFile(file);
          console.log('--mocha adding file --files:', file);
        });
      }

    }

    try {
      // Run the tests.
      console.log('--mocha run returns:', mocha.run(function (failures) {
        exit(failures);
      }));
    } catch (e) {
      throw (e);
    }

  }
}

export {
  MochaWrapper
}
