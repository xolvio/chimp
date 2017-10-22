import Forker from './forker';

describe('Forker', function () {
  describe('execute', function () {
    beforeEach(function() {
      this.forker = new Forker({fork: null});
      this.forker._startProcess = td.function();
      this.forker._exitSuccessfullyOnStartupMessage = td.function();
      this.forker._exitWithErrorOnErrorMessages = td.function();
      this.forker._exitWithErrorOnTimeout = td.function();
    });
    it('should start the process', function () {
      const scriptPath = 'some/script.js';
      this.forker.execute({scriptPath});

      td.verify(this.forker._startProcess(scriptPath));
    });
    it('should exit successfully on startup message', function () {
      const startupMessage = 'well hello';
      this.forker.execute({startupMessage});

      td.verify(this.forker._exitSuccessfullyOnStartupMessage(startupMessage));
    });
    it('should exit with error on error messages', function () {
      this.forker.execute({});

      td.verify(this.forker._exitWithErrorOnErrorMessages());
    });
    it('should exit with error on timeout', function () {
      const startupMessageTimeout = 100;
      this.forker.execute({startupMessageTimeout});

      td.verify(this.forker._exitWithErrorOnTimeout(startupMessageTimeout));
    });
  });
  describe('_startProcess', function () {
    it('should fork the script path', function () {
      const fork = td.function();

      const scriptPath = 'some/script.js';
      new Forker({fork})._startProcess(scriptPath);

      td.verify(fork(scriptPath, td.matchers.anything(), td.matchers.anything()));
    });
    it('should pass the process args to the script', function () {
      const fork = td.function();

      new Forker({fork})._startProcess();

      td.verify(fork(td.matchers.anything(), process.argv, td.matchers.anything()));
    });
    it('should pipe the stdout and stderr of the forked process', function () {
      const fork = td.function();

      new Forker({fork})._startProcess();

      td.verify(fork(td.matchers.anything(), td.matchers.anything(), {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        env: td.matchers.anything(),
        detached: td.matchers.anything(),
      }));
    });
    it('should pass the process environment to the script', function () {
      const fork = td.function();

      new Forker({fork})._startProcess();

      td.verify(fork(td.matchers.anything(), td.matchers.anything(), {
        stdio: td.matchers.anything(),
        env: td.matchers.anything(),
        detached: true
      }));
    });
    it('should fork a detached process', function () {
      const fork = td.function();

      new Forker({fork})._startProcess();

      td.verify(fork(td.matchers.anything(), td.matchers.anything(), {
        stdio: td.matchers.anything(),
        env: process.env,
        detached: td.matchers.anything(),
      }));
    });
  });
  describe('_exitSuccessfullyOnStartupMessage', function () {
    beforeEach(function() {
      this.forker = new Forker({fork: null});
      this.forker.child = {
        stdout: {
          on: (event, func) => {
            this.onStdOutDataFunc = func;
          }
        }
      };
    });
    it('should exit with a status of 0 when the startup message is matched', function () {
      this.forker._exitSuccessfullyOnStartupMessage('hello');
      process.exit = td.function();

      this.onStdOutDataFunc('a big hello to you');

      td.verify(process.exit(0));
    });
    it('should not exit with a status of 0 when the startup message is not matched', function () {
      this.forker._exitSuccessfullyOnStartupMessage('hello');
      process.exit = td.function();

      this.onStdOutDataFunc('no dice');

      td.verify(process.exit(0), {times: 0});
    });
  });
  describe('_exitWithErrorOnErrorMessages', function () {
    beforeEach(function() {
      this.forker = new Forker({fork: null});
      this.forker.child = {
        stderr: {
          on: (event, func) => {
            this.onStdErrDataFunc = func;
          }
        }
      };
    });
    it('should repeat the error message to the stderr', function () {
      this.forker._exitWithErrorOnErrorMessages();
      process.exit = td.function();
      console.error = td.function();

      this.onStdErrDataFunc('no dice');

      td.verify(console.error(td.matchers.anything(), 'no dice'));
    });
    it('should exit with a status of 1 when there is an error message', function () {
      this.forker._exitWithErrorOnErrorMessages();
      process.exit = td.function();

      this.onStdErrDataFunc('no dice');

      td.verify(process.exit(1));
    });
  });
  describe('_exitWithErrorOnTimeout', function () {
    beforeEach(function() {
      global._setTimeout = global.setTimeout;
      global.setTimeout = (func) => this.timeoutFunc = func;
    });
    afterEach(function() {
      global.setTimeout = global._setTimeout;
    });
    it('should exit with a status of 2 when the timeout is reached', function () {
      process.exit = td.function();
      const forker = new Forker({fork: null});

      forker._exitWithErrorOnTimeout();
      this.timeoutFunc();

      td.verify(process.exit(2));
    });
  });
});