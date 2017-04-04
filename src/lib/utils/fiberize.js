import Fiber from 'fibers';

// Wrap a function in a fiber.
// Correctly handles expected presence of done callback
export function fiberize(fn) {
  return function (done) {
    const self = this;
    Fiber(function () {
        if (fn.length === 1) {
          fn.call(self, done);
        } else {
          var res = fn.call(self);
          if (typeof res === 'object' && res !== null && typeof res.then === 'function') {
            res.then(() => done()).catch(done);
          } else {
            done();
          }
        }
    }).run();
  };
}

export function fiberizeSync(fn) {
  return function () {
    const self = this;
    Fiber(function () {
      fn.call(self);
    }).run();
  };
}
