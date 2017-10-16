describe('Starter', function () {
  it('should start the LongRunningChildProcess with the executable path, args and parent id', function () {
    const PATH_TO_EXECUTABLE = 4;
    const EXECUTABLE_ARGS = 5;
    const PARENT_PID = 6;
    this.executablePath = process.argv[PATH_TO_EXECUTABLE] = 'some/path';
    this.executableArgs = process.argv[EXECUTABLE_ARGS] = '["an", "arg", "or", "two"]';
    this.parentPid = process.argv[PARENT_PID] = 12345;
    class LongRunningChildProcessFake {}
    LongRunningChildProcessFake.prototype.start = td.function();
    this.LongRunningChildProcess = td.replace('./long-running-child-process', LongRunningChildProcessFake);

    require('./starter');

    td.verify(this.LongRunningChildProcess.prototype.start({
      executablePath: this.executablePath,
      executableArgs: JSON.parse(this.executableArgs),
      parentPid: this.parentPid
    }));
  });
});