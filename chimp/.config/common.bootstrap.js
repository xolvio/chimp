function setup() {
  if (global.configured) {
    return;
  }
  global.configured = true;

  require("babel-polyfill");
  const main = require('require-main-filename')();
  const quibble = require('quibble');
  const chai = require('chai');
  const td = require('testdouble');

  Object.assign(global, {
    chai,
    expect: chai.expect,
    assert: chai.assert,
    td: td,
    beforeHook: function () {
      td.reset();
      quibble.ignoreCallsFromThisFile(main);
    }
  });
  chai.should();

}

setup();