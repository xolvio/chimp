import LongRunningChildProcess from './long-running-child-process';

describe('LongRunningChildProcess', function () {
  beforeEach(function () {
    this.childProcess = {spawn: td.function()};
    this.longRunningChildProcess = new LongRunningChildProcess(this.childProcess);
    this.longRunningChildProcess._startLiveParentInterval = td.function();
  });
  describe('start', function () {
    beforeEach(function () {
      this.longRunningChildProcess._startLiveParentInterval = td.function();
    });
    it('should spawn the specified executable with the specified args', function () {
      this.longRunningChildProcess.start({
        executablePath: 'some/executable.file',
        executableArgs: ['a', 'few', 'args']
      });

      td.verify(this.childProcess.spawn('some/executable.file', ['a', 'few', 'args'], td.matchers.anything()));
    });
    it('should capture the sdio', function () {
      this.longRunningChildProcess.start({});

      td.verify(this.childProcess.spawn(td.matchers.anything(), td.matchers.anything(), {stdio: 'inherit'}));
    });
    it('should start the live parent interval', function () {
      this.longRunningChildProcess.start({});

      td.verify(this.longRunningChildProcess._startLiveParentInterval());
    });
  });
  describe('_checkForParentProcess', function () {
    it('should do nothing if the parent is alive', function () {
      process.kill = td.function();
      this.longRunningChildProcess._exit = td.function();

      this.longRunningChildProcess._checkForParentProcess();

      td.verify(this.longRunningChildProcess._exit(), {times: 0});
    });
    it('should call exit if the parent is dead', function () {
      process.kill = td.function();
      td.when(process.kill(td.matchers.anything(), 0)).thenThrow(new Error());
      this.longRunningChildProcess._exit = td.function();

      this.longRunningChildProcess._checkForParentProcess();

      td.verify(this.longRunningChildProcess._exit());
    });
  });
  describe('_exit', function () {
    it('should kill the child (wtf)', function () {
      this.longRunningChildProcess.child = {pid: 4567};
      process.kill = td.function();
      process.exit = td.function();

      this.longRunningChildProcess._exit();

      td.verify(process.kill(4567));
    });
    it('should kill thy self', function () {
      this.longRunningChildProcess.child = {};
      process.kill = td.function();
      process.exit = td.function();

      this.longRunningChildProcess._exit();

      td.verify(process.exit(0));
    });
  });
});