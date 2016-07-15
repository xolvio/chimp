jest.dontMock('../lib/process-helper');


describe('process-helper', function () {

  describe('start', function () {

    it('spawns a child, calls the callback and returns the child', function () {

      var processHelper = require('../lib/process-helper.js');

      var child = {};
      processHelper.spawn = jest.genMockFn().mockReturnValue(child);

      var options = {};
      var callback = jest.genMockFn();
      var ret = processHelper.start(options, callback);

      expect(ret).toBe(child);
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toBeFalsy();

    });

    it('waits for message if waitForMessage is provided and delegates the callback as is', function () {

      var processHelper = require('../lib/process-helper.js');

      var child = {};
      processHelper.spawn = jest.genMockFn();

      processHelper.waitForMessage = jest.genMockFn().mockImplementation(function (options, child, callback) {
        callback.apply(this, [1, 2, 3, 4]);
      });

      var options = {waitForMessage: 'not null'};
      var callback = jest.genMockFn();
      var ret = processHelper.start(options, callback);

      expect(processHelper.waitForMessage.mock.calls.length).toBe(1);
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0]).toEqual([1, 2, 3, 4]);

    });

  });

  describe('spawn', function () {

    it('calls spawn with the binary and args and returns the child process', function () {

      var cp = require('child_process'),
        processHelper = require('../lib/process-helper.js');

      processHelper.logOutputs = jest.genMockFn();

      var child = {};
      spyOn(cp, 'spawn').and.returnValue(child);

      var options = {
        bin: '/someBinary',
        args: ['bunch', 'of', 'args']
      };
      var ret = processHelper.spawn(options);

      expect(cp.spawn).toHaveBeenCalledWith(options.bin, options.args);
      expect(ret).toBe(child);

    });

    it('logs the outputs of the child process', function () {

      var cp = require('child_process'),
        processHelper = require('../lib/process-helper.js');

      processHelper.logOutputs = jest.genMockFn();

      var child = {};
      spyOn(cp, 'spawn').and.returnValue(child);

      var options = {
        prefix: 'hey bear'
      };
      var ret = processHelper.spawn(options);

      expect(processHelper.logOutputs.mock.calls.length).toBe(1);
      expect(processHelper.logOutputs.mock.calls[0][0]).toBe(options.prefix);
      expect(processHelper.logOutputs.mock.calls[0][1]).toBe(child);

    });

  });

  describe('logOutputs', function () {

    it('logs the output of the child process stderr events', function () {

      var log = require('../lib/log.js'),
        processHelper = require('../lib/process-helper.js');

      var child = {
        stdout: {
          on: jest.genMockFn().mockImplementation(function (event, eventTrigger) {
            eventTrigger('blah');
            expect(event).toBe('data');
            expect(log.debug.mock.calls.length).toBe(1);
            expect(log.debug.mock.calls[0][0]).toBe('[chimp][prefix.stdout]');
            expect(log.debug.mock.calls[0][1]).toBe('blah');
          })
        },
        stderr: {
          on: jest.genMockFn().mockImplementation(function (event, eventTrigger) {
            eventTrigger('blah blah');
            expect(event).toBe('data');
            expect(log.debug.mock.calls.length).toBe(2);
            expect(log.debug.mock.calls[1][0]).toBe('[chimp][prefix.stderr]');
            expect(log.debug.mock.calls[1][1]).toBe('blah blah');
          })
        }
      };

      processHelper.logOutputs('prefix', child);

    });

  });

  describe('waitForMessage', function () {

    it('removes the listener if the success message is seen and calls the callback', function () {

      var processHelper = require('../lib/process-helper.js');

      var callback = jest.genMockFn();

      var options = {
        prefix: '[apollo]',
        waitForMessage: 'we have lift off'
      };

      var eventToBeRemoved = false;
      var child = {
        stdout: {
          on: jest.genMockFn().mockImplementation(function (event, eventTrigger) {
            eventToBeRemoved = eventTrigger;
            eventTrigger('Huston, we have lift off!');
          }),
          removeListener: jest.genMockFn()
        }
      };

      processHelper.waitForMessage(options, child, callback);

      expect(child.stdout.removeListener.mock.calls.length).toBe(1);
      expect(child.stdout.removeListener.mock.calls[0][0]).toBe('data');
      expect(child.stdout.removeListener.mock.calls[0][1]).toBe(eventToBeRemoved);

      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toBeFalsy();

    });

    it('calls back with an error if the error message is seen', function () {

      var processHelper = require('../lib/process-helper.js');

      var callback = jest.genMockFn();

      var options = {
        prefix: '[apollo]',
        waitForMessage: 'not empty',
        errorMessage: 'engine failure'
      };

      var eventToBeRemoved = false;
      var child = {
        stdout: {
          on: jest.genMockFn().mockImplementation(function (event, eventTrigger) {
            eventTrigger('Huston, we have a problem - engine failure!');
          })
        }
      };

      processHelper.waitForMessage(options, child, callback);

      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toBe('Huston, we have a problem - engine failure!');

    });

  });

  describe('kill', function () {

    it('kills the provided process, sets it to null and calls the callback when the process is dead', function () {

      var processHelper = require('../lib/process-helper.js');

      process.kill = jest.genMockFn().mockImplementation(function () {
        // the first call checks if the process exists
        // the second call is the actual kill
        // subsequent calls are checking if the process exists
        // it takes 3 calls to go through all the execution paths for this SUT
        if (process.kill.mock.calls.length === 4) {
          throw ({code: 'ESRCH'});
        }
      });

      var options = {
        child: {
          pid: 1234
        }
      };
      var callback = jest.genMockFn();
      processHelper.kill(options, callback);
      jest.runAllTimers();

      expect(process.kill.mock.calls.length).toBe(4);
      expect(process.kill.mock.calls[0][0]).toEqual(1234);
      expect(process.kill.mock.calls[0][1]).toBe(0);
      expect(process.kill.mock.calls[1][1]).toBe('SIGTERM');
      expect(process.kill.mock.calls[2][0]).toEqual(1234);
      expect(process.kill.mock.calls[2][1]).toEqual(0);
      expect(process.kill.mock.calls[3][0]).toEqual(1234);
      expect(process.kill.mock.calls[3][1]).toEqual(0);

      expect(options.child).toBe(null);

      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toBeFalsy();

    });

  });

});
