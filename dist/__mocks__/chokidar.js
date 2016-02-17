'use strict';

var chokidar = {
  watcher: {
    on: jest.genMockFunction()
  },
  watch: jest.genMockFunction()
};
chokidar.watch.mockReturnValue(chokidar.watcher);

module.exports = chokidar;