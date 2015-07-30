var Fiber = require('fibers');
var Future = require('fibers/future');
var _ = require('underscore');
var assert = require('assert');

// Makes a function that returns a promise or takes a callback synchronous
exports.wrapAsync = function (fn, context) {
  return function (/* arguments */) {
    var self = context || this;
    var newArgs = _.toArray(arguments);
    var callback;

    for (var i = newArgs.length - 1; i >= 0; --i) {
      var arg = newArgs[i];
      var type = typeof arg;
      if (type !== "undefined") {
        if (type === "function") {
          callback = arg;
        }
        break;
      }
    }

    if (!callback) {
      var future = new Future();
      callback = _.once(future.resolver());
      ++i; // Insert the callback just after arg.
    }

    newArgs[i] = callback;
    var result = fn.apply(self, newArgs);
    if (result && _.isFunction(result.then)) {
      result.then(
        function (result) {
          callback(null, result);
        },
        function (error) {
          callback(error);
        }
      );
    }
    return future ? future.wait() : result;
  };
};
