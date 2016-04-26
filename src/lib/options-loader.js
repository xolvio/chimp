const path = require('path');
const fs = require('fs');
const log = require('./log');
import merge from 'deep-extend';

module.exports = {
  getOptions() {
    let userOptionsFile;
    const processArgv = this._getProcessArgv();
    if (processArgv[2] && processArgv[2].match(/.*chimp.*\.js$/)) {
      userOptionsFile = path.resolve(process.cwd(), processArgv[2]);
      processArgv.splice(2, 1);
      if (!fs.existsSync(userOptionsFile)) {
        log.error(('[chimp] Could not find ' + processArgv[2]).red);
        this._exit(1);
      }
    } else {
      userOptionsFile = path.resolve(process.cwd(), 'chimp.js');
    }

    let userOptions = {};
    if (fs.existsSync(userOptionsFile)) {
      userOptions = this._requireFile(userOptionsFile);
      log.debug('[chimp] loaded', userOptionsFile);
    }
    const defaultOptions = this._requireFile(this._getDefaultConfigFilePath());
    const options = merge(defaultOptions, userOptions);
    log.debug('[chimp] Chimp options are', options);
    return options;
  },
  _requireFile(file) {
    return require(file);
  },
  _getProcessArgv() {
    return process.argv;
  },
  _exit(code) {
    process.exit(code);
  },
  _getDefaultConfigFilePath() {
    return path.resolve(__dirname, '..', 'bin', 'default.js');
  },
};
