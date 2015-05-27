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

    testFramework: 'jest@0.4.3'

    // Use bootstrap function
    //bootstrap: function (wallaby) {
    //  wallaby.testFramework.configure({
    //    // https://facebook.github.io/jest/docs/api.html#config-options
    //  });
    //}
  };
};
