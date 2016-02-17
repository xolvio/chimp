var shell = require('shelljs');

module.exports = function exec(command, options) {
  if (isWindows()) {
    command = 'powershell.exe -Command "' + command + '"';
  }
  return shell.exec(command, options);
}

function isWindows() {
  return process.platform === 'win32';
}
