const finder = require('find-package-json');

module.exports = function findProjectMainPath() {
  const f = finder(process.cwd());
  return f
    .next()
    .filename.split('/')
    .filter((c) => c.indexOf('package.json') === -1)
    .join('/');
};
