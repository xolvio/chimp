module.exports = function () {

  return {
    files: [
      'bin/*.js',
      'lib/**/*.js',
      '__mocks__/*.js'
    ],

    tests: [
      '__tests__/*.js'
    ],

    env: {
      type: 'node',
      runner: 'node',
      params: {
        runner: '--harmony'
      }
    },

    testFramework: 'jest',

    bootstrap: function (wallaby) {
      var path = require('path');
      var packageConfigPath = path.resolve(wallaby.localProjectDir, 'package.json');
      var packageConfig = require(packageConfigPath);
      wallaby.testFramework.configure(packageConfig.jest);
    }
  };
};
