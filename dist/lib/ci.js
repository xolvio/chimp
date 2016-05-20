'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isCI = isCI;

var _environmentVariableParsers = require('./environment-variable-parsers');

function isCI() {
  return (0, _environmentVariableParsers.parseBoolean)(process.env.CI);
}