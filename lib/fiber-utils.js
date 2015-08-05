var Fiber = require('@xolvio/fibers');
var Future = require('@xolvio/fibers/future');
var _ = require('underscore');
var assert = require('assert');

// Makes a function that returns a promise or takes a callback synchronous
exports.wrapAsync = function (fn, context) {
  return function (/* arguments */) {
    var self = context || this;
    var newArgs = _.toArray(arguments);
    var future = new Future();
    var callback = _.once(future.resolver());

    var hasReturnedPromise = false;
    newArgs.push(function () {
      if (!hasReturnedPromise) {
        callback.apply(null, arguments);
      }
    });

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


// Makes a function that returns a promise synchronous
exports.wrapAsyncPromiseOnly = function (fn, context) {
  return function (/* arguments */) {
    var self = context || this;
    var future = new Future();

    fn.apply(self, arguments).then(
      function (result) {
        future.return(result);
      },
      function (error) {
        future.throw(error);
      }
    );

    return future.wait();
  };
};


// Makes a function that returns a promise synchronous
exports.wrapAsyncPromiseOnlyChainable = function (fn, context) {
  return function (/* arguments */) {
    var self = context || this;
    var future = new Future();

    fn.apply(self, arguments).then(
      function (result) {
        if (_.isUndefined(result)) {
          result = self;
        }
        future.return(result);
      },
      function (error) {
        future.throw(error);
      }
    );

    return future.wait();
  };
};


exports.wrapAsyncObject = function (object, properties, syncByDefault, wrapAsync) {
  syncByDefault = syncByDefault !== false;
  wrapAsync = wrapAsync || exports.wrapAsync;

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