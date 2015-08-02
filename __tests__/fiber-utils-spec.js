describe('fiber-utils', function () {
  jest.autoMockOff()
  var Fiber = require('@xolvio/fibers');
  var fiberUtils = require('../lib/fiber-utils');
  jest.autoMockOn()

  describe('wrapAsync', function () {
    describe('wrapping a function with callback', function () {
      describe('when the wrapped function is executed in a fiber', function () {
        it('the fiber is yielded until the wrapped function has called its callback', function () {
          var hasAsyncFuncRun = false;
          // We need the someValue parameter
          // because the last parameter before the callback cannot be a function.
          // wrapAsync would think that we have passed the callback.
          var asyncFunc = function (shouldFinishCheck, someValue, callback) {
            var interval = setInterval(function () {
              if (shouldFinishCheck()) {
                hasAsyncFuncRun = true;
                clearInterval(interval);
                callback();
              }
            }, 0);
          };

          var hasAfterAsyncFuncRun = false;
          var afterAsyncFunc = function () {
            hasAfterAsyncFuncRun = true;
          }

          var wrappedAsyncFunc = fiberUtils.wrapAsync(asyncFunc);

          var shouldFinish = false;
          var shouldFinishFunc = function () {
            return shouldFinish;
          }

          Fiber(function () {
            wrappedAsyncFunc(shouldFinishFunc, 'foo');
            afterAsyncFunc();
          }).run();

          jest.runOnlyPendingTimers();
          expect(hasAfterAsyncFuncRun).toBe(false);
          shouldFinish = true;
          jest.runOnlyPendingTimers();
          expect(hasAsyncFuncRun).toBe(true);
          expect(hasAfterAsyncFuncRun).toBe(true);
        })
      })
    })
  })

  describe('wrapping a function that returns a promise', function () {
    describe('when the wrapped function is executed in a fiber', function () {
      it('the fiber is yielded until the wrapped function has resolved its returned promise', function () {
        var hasAsyncFuncRun = false;
        // We need the someValue parameter
        // because the last parameter before the callback cannot be a function.
        // wrapAsync would think that we have passed the callback.
        var asyncFunc = function (shouldFinishCheck, someValue) {
          return {
            then: function (resolve) {
              var interval = setInterval(function () {
                if (shouldFinishCheck()) {
                  hasAsyncFuncRun = true;
                  clearInterval(interval);
                  resolve();
                }
              }, 0);
            }
          };
        };

        var hasAfterAsyncFuncRun = false;
        var afterAsyncFunc = function () {
          hasAfterAsyncFuncRun = true;
        }

        var wrappedFunc = fiberUtils.wrapAsync(asyncFunc);

        var shouldFinish = false;
        var shouldFinishFunc = function () {
          return shouldFinish;
        }

        Fiber(function () {
          wrappedFunc(shouldFinishFunc, 'foo');
          afterAsyncFunc();
        }).run();

        jest.runOnlyPendingTimers();
        expect(hasAfterAsyncFuncRun).toBe(false);
        shouldFinish = true;
        jest.runOnlyPendingTimers();
        expect(hasAsyncFuncRun).toBe(true);
        expect(hasAfterAsyncFuncRun).toBe(true);
      })

      describe('when the wrapped function rejects its returned promise', function () {
        it('the rejection error is thrown', function () {
          var error = new Error('Rejected promise');
          var asyncFunc = function () {
            return {
              then: function (resolve, reject) {
                reject(error);
              }
            };
          };

          var wrappedFunc = fiberUtils.wrapAsync(asyncFunc);
          var runWrappedFunc = function () {
            wrappedFunc();
          };

          expect(runWrappedFunc).toThrow(error);
        })
      })

      describe('when the wrapped function resolves its return promise', function () {
        it('the function wrapper returns the resolved value', function () {
          var returnValue = 'foo';
          var asyncFunc = function () {
            return {
              then: function (resolve) {
                resolve(returnValue);
              }
            };
          };

          var wrappedFunc = fiberUtils.wrapAsync(asyncFunc);

          expect(wrappedFunc()).toBe(returnValue);
        })
      })
    })
  })

})
