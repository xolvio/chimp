const shelljs = require('shelljs');

module.exports = function execQuietly(command, options, errorMessage) {
  const { stdout, stderr, code } = shelljs.exec(command, {
    ...options,
  });

  if (code !== 0) {
    throw new Error(`${errorMessage}: , ${stderr}`);
  }
  return stdout;
};
