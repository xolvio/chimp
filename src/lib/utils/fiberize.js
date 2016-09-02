import Fiber from 'fibers';

// Wrap a function in a fiber.
// Correctly handles expected presence of done callback
export function fiberize(fn) {
  return function (done) {
    const self = this;
    Fiber(function () {
      try {
        if (fn.length === 1) {
          fn.call(self, done);
        } else {
          fn.call(self);
          done();
        }
      } catch (error) {
        done(error);
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
