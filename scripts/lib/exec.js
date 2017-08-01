const shell = require('shelljs');

function isWindows() {
  return process.platform === 'win32';
}

module.exports = function exec(command, options) {
  if (isWindows()) {
    command = 'powershell.exe -Command "' + command + '"';
  }
  return shell.exec(command, options);
};
