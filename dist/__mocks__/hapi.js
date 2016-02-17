'use strict';

var Hapi = {
  instance: {
    connection: jest.genMockFn(),
    route: jest.genMockFn(),
    start: jest.genMockFn()
  },
  Server: function Server() {
    return Hapi.instance;
  }
};

module.exports = Hapi;