const shelljs = require('shelljs');

module.exports = function execQuietly(command, options, errorMessage) {
  const { stdout, stderr } = shelljs.exec(command, {
    ...options,
    silent: true,
  });

  if (stderr) {
    throw new Error(`${errorMessage}: , ${stderr}`);
  }
  return stdout;
};
