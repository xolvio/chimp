'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = escapeRegExp;
function escapeRegExp(string) {
  return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}