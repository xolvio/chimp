export default class Forker {
  constructor({fork} = {}) {
    this.fork = fork || require('child_process').fork;
  }

  execute({scriptPath, startupMessage, startupMessageTimeout}) {
    this._startProcess(scriptPath);
    this._exitSuccessfullyOnStartupMessage(startupMessage);
    this._exitWithErrorOnErrorMessages();
    this._exitWithErrorOnTimeout(startupMessageTimeout);
  }

  _startProcess(scriptPath) {
    this.child = this.fork(scriptPath, process.argv, {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      env: process.env,
      detached: true
    });
  }

  _exitSuccessfullyOnStartupMessage(startupMessage) {
    this.child.stdout.on('data', function (data) {
      if (data.toString().match(startupMessage)) {
        process.exit(0);
      }
    });
  };

  _exitWithErrorOnErrorMessages() {
    this.child.stderr.on('data', function (data) {
      console.error('[Chimp.Forker]', data.toString());
      process.exit(1);
    });
  }

  _exitWithErrorOnTimeout(startupMessageTimeout) {
    setTimeout(() => {
      console.error('[Chimp.Forker]', `Startup message was not see in ${startupMessageTimeout}ms. Exiting...`);
      process.exit(2);
    }, startupMessageTimeout);
  }
}