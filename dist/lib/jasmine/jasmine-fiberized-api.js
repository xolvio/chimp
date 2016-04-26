'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fiberizeJasmineApi;

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _fiberize = require('../utils/fiberize');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function fiberizeJasmineApi(context) {
  ['describe', 'xdescribe', 'fdescribe'].forEach(function (method) {
    var original = context[method];
    context[method] = _underscore2.default.wrap(original, function (fn) {
      var args = Array.prototype.slice.call(arguments, 1);
      if (_underscore2.default.isFunction(_underscore2.default.last(args))) {
        args.push((0, _fiberize.fiberizeSync)(args.pop()));
      }
      return fn.apply(this, args);
    });
  });

  ['it', 'xit', 'fit', 'beforeEach', 'afterEach', 'beforeAll', 'afterAll'].forEach(function (method) {
    var original = context[method];
    context[method] = _underscore2.default.wrap(original, function (fn) {
      var args = Array.prototype.slice.call(arguments, 1);
      if (_underscore2.default.isFunction(_underscore2.default.last(args))) {
        args.push((0, _fiberize.fiberize)(args.pop()));
      }
      return fn.apply(this, args);
    });
  });
}