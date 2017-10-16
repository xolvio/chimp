module.exports = (wallaby) => {
  const path = require('path');
  return {
    debug: false,
    testFramework: 'mocha',
    files: [
      {pattern: '**/node_modules/**', ignore: true},
      {pattern: '**/*-spec.js', ignore: true},
      '**/*.js'
    ],
    tests: [
      {pattern: '**/node_modules/**', ignore: true},
      '**/*-spec.js',
    ],
    compilers: {'**/*.js': wallaby.compilers.babel({ babel: require('../node_modules/babel-core') })},
    env: {type: 'node'},
    workers: {recycle: true},
    setup: (wallaby) => {
      wallaby.testFramework.addFile(`${wallaby.localProjectDir}/.config/mocha.bootstrap.js`);
      wallaby.testFramework.timeout(10000);
    },
  }
};