// taken from https://github.com/tzeskimo/mocha-fibers/blob/master/lib/mocha-fibers.js

// A copy of bdd interface, but beforeEach, afterEach, before, after,
// and it methods all run within fibers.
var Mocha = require('mocha'),
  bdd = Mocha.interfaces.bdd,
  _ = require('underscore'),
  util = require('util');

import {fiberize} from '../utils/fiberize';

// A copy of bdd interface, but wrapping everything in fibers
module.exports = Mocha.interfaces['fiberized-bdd-ui'] = function (suite) {
  bdd(suite);
  suite.on('pre-require', function (context) {
    // Wrap test related methods in fiber
    ['beforeEach', 'afterEach', 'after', 'before', 'it'].forEach(function (method) {
      var original = context[method];
      context[method] = _.wrap(original, function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        if (_.isFunction(_.last(args))) {
          args.push(fiberize(args.pop()));
        }
        return fn.apply(this, args);
      });
      _.extend(context[method], _(original).pick('only', 'skip'));
    });
  });
};
