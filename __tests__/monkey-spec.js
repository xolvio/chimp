jest.dontMock('../lib/monkey.js');
jest.dontMock('underscore');
jest.dontMock('async');

//jest.dontMock('loglevel'); require('loglevel').setLevel('TRACE');

describe('Monkey', function () {

  var Monkey = require('../lib/monkey');

  describe('constructor', function () {

    it('creates the processes array', function () {
      expect(new Monkey().processes).toEqual(jasmine.any(Array));
    });

    it('created an options object if non are passed', function () {
      var monkey = new Monkey();
      expect(monkey.options).toBeDefined();
    });

    it('stores the options object', function () {
      var myOptions = {};
      var monkey = new Monkey(myOptions);
      expect(monkey.options).toBe(myOptions);
    });

    it('puts all the options on the environment hash prefixed with [monkey.]', function () {

      var myOptions = {
        a: 1,
        b: "aString"
      };
      var monkey = new Monkey(myOptions);

      expect(process.env['monkey.a']).toBe(myOptions.a.toString());
      expect(process.env['monkey.b']).toBe(myOptions.b);

    });

  });

  describe('bin path', function () {

    it('sets the bin path to the location of cuke-monkey', function () {
      expect(Monkey.bin.match(/cuke-monkey\/bin\/cuke-monkey$/)).not.toBe(null);
    });

  });

  describe('init', function () {

    it('runs in single mode when no mode option is passed', function () {

      var monkey = new Monkey();

      monkey.run = jest.genMockFunction();
      monkey.start = jest.genMockFunction();
      monkey.watch = jest.genMockFunction();
      var callback = function () {};

      monkey.init(callback);

      expect(monkey.run).toBeCalledWith(callback);
      expect(monkey.run.mock.calls.length).toBe(1);

      expect(monkey.start.mock.calls.length).toBe(0);
      expect(monkey.watch.mock.calls.length).toBe(0);

    });

    it('runs in watch mode)', function () {

      var monkey = new Monkey({watch: true});

      monkey.run = jest.genMockFunction();
      monkey.start = jest.genMockFunction();
      monkey.watch = jest.genMockFunction();

      monkey.init();

      expect(monkey.watch).toBeCalledWith();
      expect(monkey.watch.mock.calls.length).toBe(1);

      expect(monkey.run.mock.calls.length).toBe(0);
      expect(monkey.start.mock.calls.length).toBe(0);
    });

    it('kicks-off the right run [default] / server / watch )', function () {

      var monkey = new Monkey({server: true});

      monkey.run = jest.genMockFunction();
      monkey.start = jest.genMockFunction();
      monkey.watch = jest.genMockFunction();

      monkey.init();

      expect(monkey.start).toBeCalledWith();
      expect(monkey.start.mock.calls.length).toBe(1);

      expect(monkey.run.mock.calls.length).toBe(0);
      expect(monkey.watch.mock.calls.length).toBe(0);
    });

  });

  describe('watch', function () {

    it('initializes chokidar', function () {

      var chokidar = require('chokidar');
      var Monkey = require('../lib/monkey.js');

      var options = {path: 'abc'};
      var monkey = new Monkey(options);
      monkey.run = jest.genMockFunction();

      monkey.watch();

      expect(chokidar.watch.mock.calls[0][0]).toBe(options.path);

    });

    it('all listener is registered after watcher is ready', function () {

      var chokidar = require('chokidar');
      var Monkey = require('../lib/monkey.js');

      var options = {path: 'abc'};
      var monkey = new Monkey(options);

      monkey.run = jest.genMockFunction();
      chokidar.watcher.on = jest.genMockFunction();

      monkey.watch();
      expect(chokidar.watcher.on.mock.calls[0][0]).toBe('ready');

      var readyCallback = chokidar.watcher.on.mock.calls[0][1];

      readyCallback();
      expect(chokidar.watcher.on.mock.calls[1][0]).toBe('all');

    });

    it('an non-unlink event triggers the interrupt and run sequence', function () {

      var chokidar = require('chokidar');
      var Monkey = require('../lib/monkey.js');

      var monkey = new Monkey();

      monkey.run = jest.genMockFunction();
      chokidar.watcher.on = jest.genMockFunction();

      monkey.watch();

      var readyCallback = chokidar.watcher.on.mock.calls[0][1];
      readyCallback();

      var allCallback = chokidar.watcher.on.mock.calls[1][1];

      monkey.rerun = jest.genMockFunction();

      allCallback('not-unlink');

      expect(monkey.rerun.mock.calls.length).toBe(1);

    });

    it('a deleted feature does not trigger the interrupt and run sequence', function () {

      var chokidar = require('chokidar');
      var Monkey = require('../lib/monkey.js');

      var monkey = new Monkey();

      monkey.run = jest.genMockFunction();
      chokidar.watcher.on = jest.genMockFunction();

      monkey.watch();

      var readyCallback = chokidar.watcher.on.mock.calls[0][1];
      readyCallback();

      var allCallback = chokidar.watcher.on.mock.calls[1][1];

      monkey.rerun = jest.genMockFunction();

      allCallback('unlink', '/path/some.feature');

      expect(monkey.rerun.mock.calls.length).toBe(0);

    });

    it('a deleted non-feature triggers the interrupt and run sequence', function () {

      var chokidar = require('chokidar');
      var async = require('async');
      var Monkey = require('../lib/monkey.js');

      var monkey = new Monkey();

      monkey.run = jest.genMockFunction();
      chokidar.watcher.on = jest.genMockFunction();

      monkey.watch();

      var readyCallback = chokidar.watcher.on.mock.calls[0][1];
      readyCallback();

      var allCallback = chokidar.watcher.on.mock.calls[1][1];

      monkey.rerun = jest.genMockFunction();

      allCallback('unlink', '/path/some.feature.js');

      expect(monkey.rerun.mock.calls.length).toBe(1);

    });

    it('runs on startup', function () {

      var chokidar = require('chokidar');
      var Monkey = require('../lib/monkey.js');

      var monkey = new Monkey();

      monkey.run = jest.genMockFunction();
      chokidar.watcher.on = jest.genMockFunction();

      monkey.watch();

      var readyCallback = chokidar.watcher.on.mock.calls[0][1];
      readyCallback();

      expect(monkey.run.mock.calls.length).toBe(1);

    });

  });

  describe('run', function () {

    it('interrupts any existing processes, starts processes and calls callback', function () {

      var monkey = new Monkey();

      monkey.interrupt = jest.genMockFunction().mockImplementation(function (callback) {
        return callback();
      });
      monkey._startProcesses = jest.genMockFunction().mockImplementation(function (callback) {
        return callback();
      });

      var callback = jest.genMockFn();
      monkey.run(callback);

      expect(monkey.interrupt.mock.calls.length).toBe(2);
      expect(monkey._startProcesses.mock.calls.length).toBe(1);
      expect(callback.mock.calls.length).toBe(1);

    });

    it('detects errors in interrupt and calls callback with an error', function () {

      var monkey = new Monkey();

      monkey.interrupt = jest.genMockFunction().mockImplementation(function (callback) {
        return callback('error');
      });

      var callback = jest.genMockFn();
      monkey.run(callback);

      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toEqual('error');

    });

    it('stops all processes on successful runs', function () {

      var monkey = new Monkey();

      monkey.interrupt = jest.genMockFunction().mockImplementation(function (callback) {
        return callback();
      });
      monkey._startProcesses = jest.genMockFunction().mockImplementation(function (callback) {
        return callback();
      });

      monkey.stop = jest.genMockFunction();

      var callback = jest.genMockFn();
      monkey.run(callback);

      expect(monkey.interrupt.mock.calls.length).toBe(2);

    });

  });

  describe('interrupt', function () {

    it('calls interrupt on all processes in the reverse order that they were started', function () {

      jest.dontMock('async');
      var Monkey = require('../lib/monkey');

      var monkey = new Monkey();

      var orderCounter = 0;

      function Process () {
        this.orderRun = -1;
      }

      Process.prototype.interrupt = function (callback) {
        this.orderRun = orderCounter++;
        callback();
      };

      var process1 = new Process('1');
      var process2 = new Process('2');
      monkey.processes = [process1, process2];

      var callback = jest.genMockFunction();

      monkey.interrupt(callback);

      expect(process2.orderRun).toBe(0);
      expect(process1.orderRun).toBe(1);

    });

    it('bubbles callback without modifying the arguments', function () {

      var async = require('async');
      var Monkey = require('../lib/monkey');

      var monkey = new Monkey();
      monkey.processes = [{interrupt: jest.genMockFn()}];
      var someArgs = ['some', 'args'];

      async.series = jest.genMockFunction().mockImplementation(function (processes, callback) {
        callback.apply(this, someArgs);
      });

      var callback = jest.genMockFn();
      monkey.interrupt(callback);

      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0]).toEqual(['some', 'args']);

    });

    it('calls the callback when no processes have been started', function () {

      var async = require('async');
      var Monkey = require('../lib/monkey');

      var monkey = new Monkey();

      async.series = jest.genMockFn();

      var callback = jest.genMockFn();
      monkey.interrupt(callback);

      expect(callback.mock.calls.length).toBe(1);
      expect(async.series.mock.calls.length).toBe(0);

    });

  });

  describe('rerun', function () {

    it('calls run if interrupt is successful', function () {

      var monkey = new Monkey();

      monkey.interrupt = jest.genMockFn().mockImplementation(function (callback) {
        callback(null);
      });

      monkey.run = jest.genMockFn();

      monkey.rerun();

      expect(monkey.run.mock.calls.length).toBe(1);

    });

    it('does not rerun if an rerun is in progress', function () {

      var monkey = new Monkey();

      monkey.run = jest.genMockFn();

      monkey.isInterrupting = true;
      monkey.rerun();

      expect(monkey.run.mock.calls.length).toBe(0);
    });

    it('reruns once it has finished rerunning', function () {

      var monkey = new Monkey();

      monkey.run = jest.genMockFn().mockImplementation(function (callback) {
        callback(null);
        // after the first run, replace this mockImplementation with a standard mock so we
        // can assert on that the rerun interrupts after a successful run
        monkey.run = jest.genMockFn();
      });

      monkey.rerun();
      monkey.rerun();

      expect(monkey.run.mock.calls.length).toBe(1);

    });

  });

  describe('_startProcesses', function () {

    it('creates an array of series of processes and starts them', function () {

      var async = require('async');

      var Monkey = require('../lib/monkey.js');

      async.series = jest.genMockFn();

      var monkey = new Monkey();
      var processes = [];
      monkey._createProcesses = jest.genMockFunction().mockReturnValue(processes);

      monkey._startProcesses();

      expect(monkey._createProcesses.mock.calls.length).toBe(1);
      expect(monkey.processes).toBe(processes);

    });

    it('start each process in its own context and calls callback once', function () {

      jest.dontMock('async');
      var Monkey = require('../lib/monkey');

      var monkey = new Monkey();

      function Process () {
        this.state = 'constructed';
      }

      Process.prototype.start = function (callback) {
        this.state = 'started';
        callback();
      };

      var processes = [new Process(), new Process()];
      monkey._createProcesses = jest.genMockFunction().mockReturnValue(processes);

      var callback = jest.genMockFunction();

      monkey._startProcesses(callback);

      expect(typeof callback.mock.calls[0][0]).toBe('undefined');
      expect(callback.mock.calls.length).toBe(1);
      expect(processes[0].state).toBe('started');
      expect(processes[1].state).toBe('started');

    });

    it('bubbles up errors in callback if an processes callback with an error', function () {

      jest.dontMock('async');
      var Monkey = require('../lib/monkey');

      var monkey = new Monkey();

      function Process () {
        this.state = 'constructed';
      }

      Process.prototype.start = function (callback) {
        this.state = 'started';
        callback('error!');
      };

      var processes = [new Process('1'), new Process('2')];
      monkey._createProcesses = jest.genMockFunction().mockReturnValue(processes);

      var callback = jest.genMockFunction();

      monkey._startProcesses(callback);

      expect(callback.mock.calls[0][0]).toBe('error!');
      expect(callback.mock.calls.length).toBe(1);
      expect(processes[0].state).toBe('started');
      expect(processes[1].state).toBe('constructed');

    });

  });

  describe('_createProcesses', function () {

    it('adds a phantom', function () {
      var Phantom = require('../lib/phantom.js');
      var Monkey = require('../lib/monkey.js');

      var options = {browser: 'phantomjs'};
      var monkey = new Monkey(options);

      var processes = monkey._createProcesses();

      expect(Phantom.mock.calls[0][0]).toBe(options);
      expect(processes.length).toBe(2);

    });

    it('adds a selenium when no browser is passed', function () {
      var Selenium = require('../lib/selenium.js');
      var Monkey = require('../lib/monkey.js');

      var options = {browser: 'some-browser', host: ''};
      var monkey = new Monkey(options);

      var processes = monkey._createProcesses();

      expect(Selenium.mock.calls[0][0]).toBe(options);
      expect(processes.length).toBe(2);
    });

    it('does not add selenium when SauceLabs is the host', function () {
      var Selenium = require('../lib/selenium.js');
      var Monkey = require('../lib/monkey.js');

      var options = {host: 'saucelabs'};
      var monkey = new Monkey(options);

      var processes = monkey._createProcesses();

      expect(Selenium.mock.calls.length).toBe(0);
      expect(processes.length).toBe(1);
    });

    it('adds cucumber last', function () {
      jest.dontMock('../lib/cucumber.js');

      var Monkey = require('../lib/monkey.js');
      var options = {browser: 'phantomjs'};

      var monkey = new Monkey(options);

      var processes = monkey._createProcesses();

      expect(typeof processes[0].cucumberChild).toBe('undefined');
      expect(typeof processes[1].cucumberChild).not.toBe('undefined');
    });

    it('should add at least one process', function () {

      var monkey = new Monkey({browser: 'phantomjs'});

      var processes = monkey._createProcesses();

      expect(processes.length).not.toBe(0);
    });

  });

});
