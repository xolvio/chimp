'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseString = parseString;
exports.parseInteger = parseInteger;
exports.parseNumber = parseNumber;
exports.parseBoolean = parseBoolean;
exports.parseNullable = parseNullable;
exports.parseNullableString = parseNullableString;
exports.parseNullableInteger = parseNullableInteger;
exports.parseNullableNumber = parseNullableNumber;
exports.parseNullableBoolean = parseNullableBoolean;

var _booleanHelper = require('./boolean-helper');

function parseString(value) {
  return value;
}

function parseInteger(value) {
  return parseInt(value, 10);
}

function parseNumber(value) {
  return Number(value);
}

function parseBoolean(value) {
  return (0, _booleanHelper.isTruthy)(value);
}

function parseNullable(value, convert) {
  return value === 'null' ? null : convert(value);
}

function parseNullableString(value) {
  return parseNullable(value, parseString);
}

function parseNullableInteger(value) {
  return parseNullable(value, parseInteger);
}

function parseNullableNumber(value) {
  return parseNullable(value, parseNumber);
}

function parseNullableBoolean(value) {
  return parseNullable(value, parseBoolean);
}