module.exports = function (wallaby) {

  var fs = require('fs');
  var path = require('path');
  var babel = require('babel-core');
  var babelConfig = JSON.parse(
    fs.readFileSync(path.join(__dirname, '.babelrc'))
  );
  babelConfig.babel = babel;

  return {
    files: [
      'src/bin/*.js',
      'src/lib/**/*.js',
      'src/__mocks__/*.js'
    ],

    tests: [
      'src/__tests__/*.js'
    ],

    compilers: {
      '**/*.js': wallaby.compilers.babel(babelConfig)
    },

    env: {
      type: 'node',
      params: {
        runner: '--harmony'
      }
    },

    testFramework: 'jest',

    bootstrap: function (wallaby) {
      var path = require('path');
      var packageConfigPath = path.resolve(wallaby.localProjectDir, 'package.json');
      var packageConfig = require(packageConfigPath);
      var jestConfig = packageConfig.jest;
      delete jestConfig.scriptPreprocessor;
      wallaby.testFramework.configure(jestConfig);
    },

    debug: true
  };
};
