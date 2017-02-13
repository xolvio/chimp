jest.dontMock('../lib/chimp.js');
jest.dontMock('../lib/boolean-helper');
jest.dontMock('underscore');
jest.dontMock('async');
jest.dontMock('wrappy');

describe('Chimp', function () {

  var Chimp = require('../lib/chimp');

  describe('constructor', function () {
    // moved to src/lib/chimp-specs.js
  });

  describe('bin path', function () {

    it('sets the bin path to the location of chimp', function () {
      expect(Chimp.bin.match(/bin\/chimp$/)).not.toBe(null);
    });

  });


  describe('init', function () {

    it('calls selectMode right away if it does not find package.json', function () {

      var chimp = new Chimp();

      var restore = chimp.fs.existsSync;
      chimp.fs.existsSync = jest.genMockFn().mockReturnValue(false);

      chimp.informUser = jest.genMockFunction();
      chimp.exec = jest.genMockFunction();

      chimp.selectMode = jest.genMockFunction();
      var callback = function () {};

      chimp.init(callback);

      expect(chimp.selectMode).toBeCalledWith(callback);
      expect(chimp.exec).not.toBeCalled();

      chimp.fs.existsSync = restore;

    });

    it('does not executes npm install if the offline option is set', function () {

      var chimp = new Chimp({offline: true});

      var restore = chimp.fs.existsSync;
      chimp.fs.existsSync = jest.genMockFn().mockReturnValue(true);

      chimp.informUser = jest.genMockFunction();
      chimp.exec = jest.genMockFunction();

      chimp.selectMode = jest.genMockFunction();
      var callback = jest.genMockFunction();

      chimp.init(callback);

      expect(chimp.exec.mock.calls.length).toBe(0);
      expect(chimp.selectMode.mock.calls.length).toBe(1);
      expect(callback.mock.calls.length).toBe(0);

      chimp.fs.existsSync = restore;

    });

    it('executes npm install then calls selectMode when there are no errors', function () {

      var chimp = new Chimp();

      var restore = chimp.fs.existsSync;
      chimp.fs.existsSync = jest.genMockFn().mockReturnValue(true);

      chimp.informUser = jest.genMockFunction();
      chimp.exec = jest.genMockFunction().mockImplementation(function (cmd, callback) {
        return callback(null);
      });


      chimp.selectMode = jest.genMockFunction();
      var callback = function () {};

      chimp.init(callback);

      expect(chimp.selectMode).toBeCalledWith(callback);

      chimp.fs.existsSync = restore;
    });

  });

  describe('selectMode', function () {

    it('runs in single mode when no mode option is passed', function () {

      var chimp = new Chimp();

      chimp.run = jest.genMockFunction();
      chimp.start = jest.genMockFunction();
      chimp.watch = jest.genMockFunction();
      chimp.server = jest.genMockFunction();
      var callback = function () {};

      chimp.selectMode(callback);

      expect(chimp.run).toBeCalledWith(callback);
      expect(chimp.run.mock.calls.length).toBe(1);

      expect(chimp.start.mock.calls.length).toBe(0);
      expect(chimp.watch.mock.calls.length).toBe(0);
      expect(chimp.server.mock.calls.length).toBe(0);

    });

    it('runs in watch mode)', function () {

      var chimp = new Chimp({watch: true});

      chimp.run = jest.genMockFunction();
      chimp.start = jest.genMockFunction();
      chimp.watch = jest.genMockFunction();
      chimp.server = jest.genMockFunction();

      chimp.selectMode();

      expect(chimp.watch).toBeCalledWith();
      expect(chimp.watch.mock.calls.length).toBe(1);

      expect(chimp.run.mock.calls.length).toBe(0);
      expect(chimp.start.mock.calls.length).toBe(0);
      expect(chimp.server.mock.calls.length).toBe(0);
    });

    it('runs in server mode)', function () {

      var chimp = new Chimp({server: true});

      chimp.run = jest.genMockFunction();
      chimp.start = jest.genMockFunction();
      chimp.watch = jest.genMockFunction();
      chimp.server = jest.genMockFunction();

      chimp.selectMode();

      expect(chimp.server.mock.calls.length).toBe(1);
      expect(typeof chimp.server.mock.calls[0][0]).toBe('undefined');

      expect(chimp.watch.mock.calls.length).toBe(0);
      expect(chimp.run.mock.calls.length).toBe(0);
      expect(chimp.start.mock.calls.length).toBe(0);
    });

  });

  describe('watch', function () {

    it('initializes chokidar', function () {

      var chokidar = require('chokidar');
      var Chimp = require('../lib/chimp.js');

      var options = {path: 'abc'};
      var chimp = new Chimp(options);
      chimp.run = jest.genMockFunction();

      chimp.watch();

      expect(chokidar.watch.mock.calls[0][0]).toEqual([options.path]);

    });

    it('all listener is registered after watcher is ready', function () {

      var chokidar = require('chokidar');
      var Chimp = require('../lib/chimp.js');

      var options = {path: 'abc'};
      var chimp = new Chimp(options);

      chimp.run = jest.genMockFunction();
      chokidar.watcher.on = jest.genMockFunction();

      chimp.watch();
      expect(chokidar.watcher.once.mock.calls[0][0]).toBe('ready');

      var readyCallback = chokidar.watcher.once.mock.calls[0][1];

      readyCallback();
      expect(chokidar.watcher.on.mock.calls[0][0]).toBe('all');

    });

    it('an non-unlink event triggers the interrupt and run sequence', function () {

      var chokidar = require('chokidar');
      var Chimp = require('../lib/chimp.js');

      var chimp = new Chimp();

      chimp.run = jest.genMockFunction();

      chimp.watch();

      var readyCallback = chokidar.watcher.once.mock.calls[0][1];
      readyCallback();

      var allCallback = chokidar.watcher.on.mock.calls[0][1];

      chimp.rerun = jest.genMockFunction();

      allCallback('not-unlink');

      expect(chimp.rerun.mock.calls.length).toBe(1);

    });

    it('a deleted feature does not trigger the interrupt and run sequence', function () {

      var chokidar = require('chokidar');
      var Chimp = require('../lib/chimp.js');

      //var _on = process.on;
      //process.on = jest.genMockFunction();

      var chimp = new Chimp();

      chimp.run = jest.genMockFunction();

      chimp.watch();

      var readyCallback = chokidar.watcher.once.mock.calls[0][1];
      readyCallback();

      var allCallback = chokidar.watcher.on.mock.calls[0][1];

      chimp.rerun = jest.genMockFunction();

      allCallback('unlink', '/path/some.feature');

      expect(chimp.rerun.mock.calls.length).toBe(0);

      //process.on = _on;

    });

    it('a deleted non-feature triggers the interrupt and run sequence', function () {

      var chokidar = require('chokidar');
      var async = require('async');
      var Chimp = require('../lib/chimp.js');

      var chimp = new Chimp();

      chimp.run = jest.genMockFunction();

      chimp.watch();

      var readyCallback = chokidar.watcher.once.mock.calls[0][1];
      readyCallback();

      var allCallback = chokidar.watcher.on.mock.calls[0][1];

      chimp.rerun = jest.genMockFunction();

      allCallback('unlink', '/path/some.feature.js');

      expect(chimp.rerun.mock.calls.length).toBe(1);

    });

    it('runs on startup', function () {

      var chokidar = require('chokidar');
      var Chimp = require('../lib/chimp.js');

      var chimp = new Chimp();

      chimp.run = jest.genMockFunction();

      chimp.watch();

      var readyCallback = chokidar.watcher.once.mock.calls[0][1];
      readyCallback();

      expect(chimp.run.mock.calls.length).toBe(1);

    });

    it('uses the watchTag with cucumber', function () {

      var Chimp = require('../lib/chimp.js');

      var chimp = new Chimp({
        watchTags: '@someTag,@andAnotherTag'
      });

      chimp.watch();

      expect(chimp.options.tags).toBe('@someTag,@andAnotherTag');

    });

  });

  describe('server', function () {

    it('listens on a freeport when server-port is not provided', function () {
      var freeport = require('freeport');
      var Chimp = require('../lib/chimp.js');
      var chimp = new Chimp();

      chimp.server();

      expect(freeport.mock.calls.length).toBe(1);
    });

    it('listens on the server-port when it is provided', function () {
      var freeport = require('freeport');
      var Chimp = require('../lib/chimp.js');
      var chimp = new Chimp({serverPort: 1234});

      chimp._startServer = jest.genMockFn();

      chimp.server();

      expect(chimp._startServer.mock.calls.length).toBe(1);
      expect(chimp._startServer.mock.calls[0][0]).toBe(1234);
      expect(freeport.mock.calls.length).toBe(0);
    });

    it('handshakes with a DDP endpoint with the server address on startup if ddp is passed', function () {

      // TODO having some issues testing this. DDPClient is tricky to jest up

    });

    it('exposes the run and interrupt endpoints', function () {

      var Hapi = require('hapi');

      var Chimp = require('../lib/chimp.js');
      var chimp = new Chimp({serverHost: 'localhost', serverPort: 1234});

      chimp.server();

      expect(Hapi.instance.route.mock.calls[0][0].method).toBe('GET');
      expect(Hapi.instance.route.mock.calls[0][0].path).toBe('/run');

      expect(Hapi.instance.route.mock.calls[1][0].method).toBe('GET');
      expect(Hapi.instance.route.mock.calls[1][0].path).toBe('/run/{absolutePath*}');

      expect(Hapi.instance.route.mock.calls[2][0].method).toBe('GET');
      expect(Hapi.instance.route.mock.calls[2][0].path).toBe('/interrupt');

      expect(Hapi.instance.route.mock.calls[3][0].method).toBe('GET');
      expect(Hapi.instance.route.mock.calls[3][0].path).toBe('/runAll');

    });

    it('returns cucumber results when run handler is called successfully', function () {

      var Hapi = require('hapi');
      var Chimp = require('../lib/chimp.js');
      var chimp = new Chimp({serverHost: 'localhost', serverPort: 1234});

      chimp.rerun = jest.genMockFunction().mockImplementation(function (callback) {
        return callback(null,
          [null, [null, 'cucumber results']]
        );
      });


      chimp.server();
      var getHandler = Hapi.instance.route.mock.calls[0][0].handler;
      var headerMock = jest.genMockFn();
      var reply = jest.genMockFn().mockReturnValue({header: headerMock});
      getHandler(null, reply);

      expect(reply.mock.calls[0][0]).toBe('cucumber results');

    });

    it('returns cucumber results when run handler is called successfully with a feature', function () {

      var Hapi = require('hapi');
      var Chimp = require('../lib/chimp.js');
      var chimp = new Chimp({serverHost: 'localhost', serverPort: 1234});
      chimp.options._ = {};

      chimp.rerun = jest.genMockFunction().mockImplementation(function (callback) {
        return callback(null,
          [null, [null, 'cucumber results']]
        );
      });

      chimp.server();
      var getHandler = Hapi.instance.route.mock.calls[1][0].handler;
      var request = {params: {absolutePath: 'blah'}};
      var headerMock = jest.genMockFn();
      var reply = jest.genMockFn().mockReturnValue({header: headerMock});
      getHandler(request, reply);

      expect(chimp.options._[2]).toBe(request.params.absolutePath);
      expect(reply.mock.calls[0][0]).toBe('cucumber results');

    });

    it('returns "done" when interrupt handler is called successfully', function () {

      var Hapi = require('hapi');
      var Chimp = require('../lib/chimp.js');
      var chimp = new Chimp({serverHost: 'localhost', serverPort: 1234});

      chimp.interrupt = jest.genMockFunction().mockImplementation(function (callback) {
        return callback(null,
          [null, [null, 'cucumber results']]
        );
      });

      chimp.server();
      var interruptHandler = Hapi.instance.route.mock.calls[2][0].handler;
      var headerMock = jest.genMockFn();
      var reply = jest.genMockFn().mockReturnValue({header: headerMock});
      interruptHandler(null, reply);

      expect(reply.mock.calls[0][0]).toBe('done');

    });

    it('returns cucumber results when runAll handler is called successfully', function () {

      var Hapi = require('hapi');
      var Chimp = require('../lib/chimp.js');
      var chimp = new Chimp({serverHost: 'localhost', serverPort: 1234});

      chimp.rerun = jest.genMockFunction().mockImplementation(function (callback) {
        return callback(null,
          [null, [null, 'cucumber results']]
        );
      });

      chimp.server();
      var getHandler = Hapi.instance.route.mock.calls[3][0].handler;
      var headerMock = jest.genMockFn();
      var reply = jest.genMockFn().mockReturnValue({header: headerMock});
      getHandler(null, reply);

      expect(reply.mock.calls[0][0]).toBe('cucumber results');
    });

  });

  describe('run', function () {

    it('interrupts any existing processes, starts processes and calls callback', function () {

      var chimp = new Chimp();

      chimp.interrupt = jest.genMockFunction().mockImplementation(function (callback) {
        return callback();
      });
      chimp._startProcesses = jest.genMockFunction().mockImplementation(function (callback) {
        return callback();
      });

      var callback = jest.genMockFn();
      chimp.run(callback);

      expect(chimp.interrupt.mock.calls.length).toBe(2);
      expect(chimp._startProcesses.mock.calls.length).toBe(1);
      expect(callback.mock.calls.length).toBe(1);

    });

    it('detects errors in interrupt and calls callback with an error', function () {

      var chimp = new Chimp();

      chimp.interrupt = jest.genMockFunction().mockImplementation(function (callback) {
        return callback('error');
      });

      var callback = jest.genMockFn();
      chimp.run(callback);

      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toEqual('error');

    });

    it('stops all processes on successful runs', function () {

      var chimp = new Chimp();

      chimp.interrupt = jest.genMockFunction().mockImplementation(function (callback) {
        return callback();
      });
      chimp._startProcesses = jest.genMockFunction().mockImplementation(function (callback) {
        return callback();
      });

      chimp.stop = jest.genMockFunction();

      var callback = jest.genMockFn();
      chimp.run(callback);

      expect(chimp.interrupt.mock.calls.length).toBe(2);

    });

    it('passes the options to the simian reporter constructor', function () {

      var SimianReporter = require('../lib/simian-reporter');

      var Chimp = require('../lib/chimp.js');

      var options = {simianAccessToken: 'present'};
      var chimp = new Chimp(options);

      chimp.interrupt = jest.genMockFunction().mockImplementation(function (callback) {
        return callback();
      });
      chimp._startProcesses = jest.genMockFunction().mockImplementation(function (callback) {
        return callback();
      });

      var callback = jest.genMockFn();
      chimp.run(callback);

      expect(SimianReporter.mock.calls[0][0]).toBe(options);
      expect(SimianReporter.mock.calls.length).toBe(1);

    });

    it('calls the simian reporter when the run is finished', function () {

      jest.dontMock('../lib/simian-reporter');
      var SimianReporter = require('../lib/simian-reporter');
      SimianReporter.prototype.report = jest.genMockFn();

      var Chimp = require('../lib/chimp.js');

      var options = {simianAccessToken: 'present'};
      var chimp = new Chimp(options);

      chimp.interrupt = jest.genMockFunction().mockImplementation(function (callback) {
        return callback(null, 'hello');
      });
      chimp._startProcesses = jest.genMockFunction().mockImplementation(function (callback) {
        return callback(null, [undefined, '[]']);
      });

      var callback = jest.genMockFn();
      chimp.run(callback);

      expect(SimianReporter.instance.report.mock.calls.length).toBe(1);

    });

  });

  describe('interrupt', function () {

    it('calls interrupt on all processes in the reverse order that they were started', function () {

      jest.dontMock('async');
      var Chimp = require('../lib/chimp');

      var chimp = new Chimp();

      var orderCounter = 0;

      function Process() {
        this.orderRun = -1;
      }

      Process.prototype.interrupt = function (callback) {
        this.orderRun = orderCounter++;
        callback();
      };

      var process1 = new Process('1');
      var process2 = new Process('2');
      chimp.processes = [process1, process2];

      var callback = jest.genMockFunction();

      chimp.interrupt(callback);

      expect(process2.orderRun).toBe(0);
      expect(process1.orderRun).toBe(1);

    });

    it('bubbles callback without modifying the arguments', function () {

      var async = require('async');
      var Chimp = require('../lib/chimp');

      var chimp = new Chimp();
      chimp.processes = [{interrupt: jest.genMockFn()}];
      var someArgs = ['some', 'args'];

      async.series = jest.genMockFunction().mockImplementation(function (processes, callback) {
        callback.apply(this, someArgs);
      });

      var callback = jest.genMockFn();
      chimp.interrupt(callback);

      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0]).toEqual(['some', 'args']);

    });

    it('calls the callback when no processes have been started', function () {

      var async = require('async');
      var Chimp = require('../lib/chimp');

      var chimp = new Chimp();
      chimp.isInterrupting = true;

      async.series = jest.genMockFn();

      var callback = jest.genMockFn();
      chimp.interrupt(callback);

      expect(chimp.isInterrupting).toBe(false);
      expect(callback.mock.calls.length).toBe(1);
      expect(async.series.mock.calls.length).toBe(0);

    });

    it('cancels the isInterrupting flag after all processes have run with no errors', function () {

      var _ = require('underscore');
      var async = require('async');
      var Chimp = require('../lib/chimp');
      var chimp = new Chimp();

      chimp.isInterrupting = true;
      chimp.processes = ['yo'];
      _.collect = jest.genMockFn();

      async.series = jest.genMockFn().mockImpl(function (procs, func) {
        func();
      });

      chimp.interrupt(jest.genMockFn());

      expect(chimp.isInterrupting).toBe(false);

    });

    it('cancels the isInterrupting flag after all processes have run with errors', function () {

      var _ = require('underscore');
      var async = require('async');
      var Chimp = require('../lib/chimp');
      var chimp = new Chimp();

      chimp.isInterrupting = true;
      chimp.processes = ['yo'];
      _.collect = jest.genMockFn();

      async.series = jest.genMockFn().mockImpl(function (procs, func) {
        func('error');
      });

      chimp.interrupt(jest.genMockFn());

      expect(chimp.isInterrupting).toBe(false);

    });

  });

  describe('rerun', function () {

    it('calls run if interrupt is successful', function () {

      var chimp = new Chimp();

      chimp.interrupt = jest.genMockFn().mockImplementation(function (callback) {
        callback(null);
      });

      chimp.run = jest.genMockFn();

      chimp.rerun();

      expect(chimp.run.mock.calls.length).toBe(1);

    });

    it('does not rerun if an rerun is in progress', function () {

      var chimp = new Chimp();

      chimp.run = jest.genMockFn();

      chimp.isInterrupting = true;
      chimp.rerun();

      expect(chimp.run.mock.calls.length).toBe(0);
    });

    it('reruns once it has finished rerunning', function () {

      var chimp = new Chimp();

      chimp.run = jest.genMockFn().mockImplementation(function (callback) {
        callback(null);
        // after the first run, replace this mockImplementation with a standard mock so we
        // can assert on that the rerun interrupts after a successful run
        chimp.run = jest.genMockFn();
      });

      chimp.rerun();
      chimp.rerun();

      expect(chimp.run.mock.calls.length).toBe(1);

    });

  });

  describe('_startProcesses', function () {

    it('creates an array of series of processes and starts them', function () {

      var async = require('async');

      var Chimp = require('../lib/chimp.js');

      async.series = jest.genMockFn();

      var chimp = new Chimp();
      var processes = [];
      chimp._createProcesses = jest.genMockFunction().mockReturnValue(processes);

      chimp._startProcesses();

      expect(chimp._createProcesses.mock.calls.length).toBe(1);
      expect(chimp.processes).toBe(processes);

    });

    it('start each process in its own context and calls callback once', function () {

      jest.dontMock('async');
      var Chimp = require('../lib/chimp');

      var chimp = new Chimp();

      function Process() {
        this.state = 'constructed';
      }

      Process.prototype.start = function (callback) {
        this.state = 'started';
        callback();
      };

      var processes = [new Process(), new Process()];
      chimp._createProcesses = jest.genMockFunction().mockReturnValue(processes);

      var callback = jest.genMockFunction();

      chimp._startProcesses(callback);

      expect(typeof callback.mock.calls[0][0]).toBe('undefined');
      expect(callback.mock.calls.length).toBe(1);
      expect(processes[0].state).toBe('started');
      expect(processes[1].state).toBe('started');

    });

    it('bubbles up errors in callback if an processes callback with an error', function () {

      jest.dontMock('async');
      var Chimp = require('../lib/chimp');

      var chimp = new Chimp();

      function Process() {
        this.state = 'constructed';
      }

      Process.prototype.start = function (callback) {
        this.state = 'started';
        callback('error!');
      };

      var processes = [new Process('1'), new Process('2')];
      chimp._createProcesses = jest.genMockFunction().mockReturnValue(processes);

      var callback = jest.genMockFunction();

      chimp._startProcesses(callback);

      expect(callback.mock.calls[0][0]).toBe('error!');
      expect(callback.mock.calls.length).toBe(1);
      expect(processes[0].state).toBe('started');
      expect(processes[1].state).toBe('constructed');

    });

    it('cancels the isInterrupting flag on error', function () {

      var _ = require('underscore');
      var async = require('async');
      var Chimp = require('../lib/chimp');
      var chimp = new Chimp();

      chimp.isInterrupting = true;
      chimp._createProcesses = jest.genMockFn();
      _.collect = jest.genMockFn().mockReturnValue(['yo']);

      async.series = jest.genMockFn().mockImpl(function (procs, func) {
        func('error');
      });

      chimp._startProcesses(jest.genMockFn());

      expect(chimp.isInterrupting).toBe(false);

    });

  });

  describe('_createProcesses', function () {

    it('adds a phantom', function () {
      var Phantom = require('../lib/phantom.js');
      var Chimp = require('../lib/chimp.js');

      var options = {browser: 'phantomjs'};
      var chimp = new Chimp(options);

      var processes = chimp._createProcesses();

      expect(Phantom.mock.calls[0][0]).toBe(options);
      expect(processes.length).toBe(2);

    });

    it('adds a selenium when no browser is passed', function () {
      var Selenium = require('../lib/selenium.js');
      var Chimp = require('../lib/chimp.js');

      var options = {browser: 'some-browser', host: ''};
      var chimp = new Chimp(options);

      var processes = chimp._createProcesses();

      expect(Selenium.mock.calls[0][0]).toBe(options);
      expect(processes.length).toBe(2);
    });

    it('does not add selenium when SauceLabs is the host', function () {
      var Selenium = require('../lib/selenium.js');
      var Chimp = require('../lib/chimp.js');

      var options = {host: 'saucelabs'};
      var chimp = new Chimp(options);

      var processes = chimp._createProcesses();

      expect(Selenium.mock.calls.length).toBe(0);
      expect(processes.length).toBe(1);
    });

    it('adds cucumber last', function () {
      jest.dontMock('../lib/cucumberjs/cucumber.js');

      var Chimp = require('../lib/chimp.js');
      var options = {browser: 'phantomjs'};

      var chimp = new Chimp(options);

      var processes = chimp._createProcesses();

      expect(typeof processes[0].cucumberChild).toBe('undefined');
      expect(typeof processes[1].cucumberChild).not.toBe('undefined');
    });

    it('should add at least one process', function () {

      var chimp = new Chimp({browser: 'phantomjs'});

      var processes = chimp._createProcesses();

      expect(processes.length).not.toBe(0);
    });

  });

});
