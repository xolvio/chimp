(function () {
  const chai = require('chai');
  chai.should();
  global.expect = chai.expect;
  global.assert = chai.assert;

  const td = require('testdouble');
  const quibble = require('quibble');
  global.td = td;

  beforeEach(() => {
    td.reset();
    quibble.ignoreCallsFromThisFile(require.main.filename);
  });
})();
