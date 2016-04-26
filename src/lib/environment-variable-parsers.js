import {isTruthy} from './boolean-helper';

export function parseString(value) {
  return value;
}

export function parseInteger(value) {
  return parseInt(value, 10);
}

export function parseNumber(value) {
  return Number(value);
}

export function parseBoolean(value) {
  return isTruthy(value);
}

export function parseNullable(value, convert) {
  return value === 'null' ? null : convert(value);
}

export function parseNullableString(value) {
  return parseNullable(value, parseString);
}

export function parseNullableInteger(value) {
  return parseNullable(value, parseInteger);
}

export function parseNullableNumber(value) {
  return parseNullable(value, parseNumber);
}

export function parseNullableBoolean(value) {
  return parseNullable(value, parseBoolean);
}
