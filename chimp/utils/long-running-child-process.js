export default class LongRunningChildProcess {
  constructor(childProcess = require('child_process')) {
    this.childProcess = childProcess;
  }

  start({executablePath, executableArgs, parentPid, parentCheckInterval = 1000}) {
    this.executablePath = executablePath;
    this.executableArgs = executableArgs;
    this.parentPid = parentPid;
    this.parentCheckInterval = parentCheckInterval;
    this.child = this.childProcess.spawn(this.executablePath, this.executableArgs, {stdio: 'inherit'});
    this._startLiveParentInterval();
  }

  _startLiveParentInterval() {
    setInterval(() => this._checkForParentProcess(), this.parentCheckInterval);
  }

  _checkForParentProcess() {
    try {
      process.kill(this.parentPid, 0);
    } catch (err) {
      this._exit();
    }
  }

  _exit() {
    process.kill(this.child.pid);
    process.exit(0);
  }
}