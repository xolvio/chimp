module.exports = (wallaby) => {
  const path = require('path');
  const packageJson = require(`${wallaby.localProjectDir}/package.json`);
  return {
    debug: false,
    testFramework: 'mocha',
    files: packageJson.mocha.files,
    tests: packageJson.mocha.tests,
    compilers: {'**/*.js': wallaby.compilers.babel()},
    env: {type: 'node'},
    workers: {initial: 1, regular: 1, recycle: true},
    setup: () => {
      wallaby.testFramework.addFile(`${wallaby.localProjectDir}/mocha-setup.js`);
    },
  }
};
