var Fiber = require('@xolvio/fibers');
var Future = require('@xolvio/fibers/future');
var _ = require('underscore');
var assert = require('assert');

// Makes a function that returns a promise or takes a callback synchronous
exports.wrapAsync = function (fn, context, options) {
  return function (/* arguments */) {
    var self = context || this;
    options = _.defaults({}, options, {
      supportCallback: true
    })
    var newArgs = _.toArray(arguments);
    var future = new Future();
    var callback = _.once(function resolver(error, result) {
      if (error) {
        future.throw(error);
      } else {
        if (_.isUndefined(result)) {
          result = self;
        }
        future.return(result);
      }
    });

    var hasReturnedPromise = false;
    if (options.supportCallback) {
      newArgs.push(function () {
        if (!hasReturnedPromise) {
          callback.apply(null, arguments);
        }
      });
    }

    var result = fn.apply(self, newArgs);
    if (result && _.isFunction(result.then)) {
      hasReturnedPromise = true;
      result.then(
        function (result) {
          callback(null, result);
        },
        function (error) {
          callback(error);
        }
      );
    }

    return future.wait();
  };
};


exports.wrapAsyncObject = function (object, properties, options) {
  options = options || {};
  var syncByDefault = options.syncByDefault !== false;
  var wrapAsync = options.wrapAsync || exports.wrapAsync;

  _.forEach(properties, function (propertyName) {
    var asyncMethod = object[propertyName];
    if (_.isFunction(asyncMethod)) {
      var syncMethod = wrapAsync(asyncMethod, object);
      object[propertyName + 'Async'] = asyncMethod;
      object[propertyName + 'Sync'] = syncMethod;
      if (syncByDefault) {
        object[propertyName] = syncMethod;
      }
    }
  });
};
