'use strict';

module.exports = { isFalsey: isFalsey, isTruthy: isTruthy };

function isFalsey(variable) {
  return !variable || variable === 'false' || variable === 'null' || variable === '';
}

function isTruthy(variable) {
  return !isFalsey(variable);
}