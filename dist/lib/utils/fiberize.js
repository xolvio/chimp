'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fiberize = fiberize;
exports.fiberizeSync = fiberizeSync;

var _fibers = require('fibers');

var _fibers2 = _interopRequireDefault(_fibers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Wrap a function in a fiber.
// Correctly handles expected presence of done callback
function fiberize(fn) {
  return function (done) {
    var self = this;
    (0, _fibers2.default)(function () {
      try {
        if (fn.length == 1) {
          fn.call(self, done);
        } else {
          fn.call(self);
          done();
        }
      } catch (e) {
        process.nextTick(function () {
          throw e;
        });
      }
    }).run();
  };
}

function fiberizeSync(fn) {
  return function () {
    var self = this;
    (0, _fibers2.default)(function () {
      fn.call(self);
    }).run();
  };
}