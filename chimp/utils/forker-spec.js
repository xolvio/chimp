describe('Forker', function () {
  beforeEach(function () {
    const STARTUP_MESSAGE = 5;
    const STARTUP_MESSAGE_TIMEOUT = 6;
    this.startupMessage = process.argv[STARTUP_MESSAGE] = 'hello there';
    this.startupMessageTimeout = process.argv[STARTUP_MESSAGE_TIMEOUT] = 1000;
    this.child_process = td.object({fork: td.function()});
    td.replace('child_process', this.child_process);
    this.proc = {
      stdout: {on: (event, func) => this.stdoutOnData = func},
      stderr: {on: (event, func) => this.stderrOnData = func},
    };
    global.setTimeout = (func) => this.timeoutFunc = func;
    process.exit = td.function();
  });
  it('should start the starter', function () {
    td.when(this.child_process.fork(td.matchers.anything(), td.matchers.anything(), td.matchers.anything())).thenReturn(this.proc);

    require('./forker');

    td.verify(this.child_process.fork(__dirname + '/starter.js', td.matchers.anything(), td.matchers.anything()));
  });
  it('should pass the args to the starter', function () {
    td.when(this.child_process.fork(td.matchers.anything(), td.matchers.anything(), td.matchers.anything())).thenReturn(this.proc);

    require('./forker');

    td.verify(this.child_process.fork(td.matchers.anything(), process.argv, td.matchers.anything()));
  });
  it('should pass the environment to the starter', function () {
    td.when(this.child_process.fork(td.matchers.anything(), td.matchers.anything(), td.matchers.anything())).thenReturn(this.proc);

    require('./forker');

    td.verify(this.child_process.fork(td.matchers.anything(), td.matchers.anything(), {
      stdio: td.matchers.anything(),
      env: process.env,
      detached: td.matchers.anything()
    }));
  });
  it('should fork a detached starter process', function () {
    td.when(this.child_process.fork(td.matchers.anything(), td.matchers.anything(), td.matchers.anything())).thenReturn(this.proc);

    require('./forker');

    td.verify(this.child_process.fork(td.matchers.anything(), td.matchers.anything(), {
      stdio: td.matchers.anything(),
      env: td.matchers.anything(),
      detached: true
    }));
  });
  it('should exit with a status of 0 when the startup message is matched', function () {
    td.when(this.child_process.fork(td.matchers.anything(), td.matchers.anything(), td.matchers.anything())).thenReturn(this.proc);

    require('./forker');
    this.stdoutOnData('hello there');

    td.verify(process.exit(0));
  });
  it('should not exit with a status of 0 when the startup message is not matched', function () {
    td.when(this.child_process.fork(td.matchers.anything(), td.matchers.anything(), td.matchers.anything())).thenReturn(this.proc);

    require('./forker');
    this.stdoutOnData('mismatch');

    td.verify(process.exit(0), {times: 0});
  });
  it('should exit with a status of 1 when there is an error message', function () {
    td.when(this.child_process.fork(td.matchers.anything(), td.matchers.anything(), td.matchers.anything())).thenReturn(this.proc);

    require('./forker');
    this.stderrOnData('some error');

    td.verify(process.exit(1));
  });
  it('should exit with a status of 2 when the timeout is reached', function () {
    td.when(this.child_process.fork(td.matchers.anything(), td.matchers.anything(), td.matchers.anything())).thenReturn(this.proc);

    require('./forker');
    this.timeoutFunc();

    td.verify(process.exit(2));
  });
});