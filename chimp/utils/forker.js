export default class Forker {
  constructor({fork = require('child_process').fork}) {
    this.fork = fork;
  }

  execute({scriptPath, startupMessage, startupMessageTimeout}) {
    this.startProcess(scriptPath);
    this.exitSuccessfullyOnStartupMessage(startupMessage);
    this.exitWithErrorOnErrorMessages();
    this.exitWithErrorOnTimeout(startupMessageTimeout);
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
      console.error('[Chimp.Forker]', `Startup message was not see in ${this.startupMessageTimeout}ms. Exiting...`);
      process.exit(2);
    }, this.startupMessageTimeout);
  }
}