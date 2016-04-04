import _ from 'underscore';
import {fiberize, fiberizeSync} from '../utils/fiberize';

export default function fiberizeJasmineApi(context) {
  ['describe', 'xdescribe', 'fdescribe'].forEach(function (method) {
    const original = context[method];
    context[method] = _.wrap(original, function (fn) {
      const args = Array.prototype.slice.call(arguments, 1);
      if (_.isFunction(_.last(args))) {
        args.push(fiberizeSync(args.pop()));
      }
      return fn.apply(this, args);
    });
  });

  [
    'it', 'xit', 'fit',
    'beforeEach', 'afterEach',
    'beforeAll', 'afterAll',
  ].forEach(function (method) {
    const original = context[method];
    context[method] = _.wrap(original, function (fn) {
      const args = Array.prototype.slice.call(arguments, 1);
      if (_.isFunction(_.last(args))) {
        args.push(fiberize(args.pop()));
      }
      return fn.apply(this, args);
    });
  });
}
