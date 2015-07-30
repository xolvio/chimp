// A wrapped webdriverio with synchronous API using fibers.

var webdriverio = require('webdriverio');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var fiberUtils = require('./fiber-utils');

var webdriverioWithSync = _.clone(webdriverio);

webdriverioWithSync.remote = function () {
  var remote = webdriverio.remote.apply(webdriverio, arguments);

  ['protocol', 'commands'].forEach(function(commandType) {
    var dir = path.resolve(
      __dirname,
      path.join('..', 'node_modules', 'webdriverio', 'lib', commandType)
    );
    var files = fs.readdirSync(dir);

    files.forEach(function(filename) {
      var commandName = filename.slice(0, -3);
      remote[commandName + 'Async'] = remote[commandName];
      remote[commandName] = fiberUtils.wrapAsync(remote[commandName], remote);
    });
  });

  return remote;
};

module.exports = webdriverioWithSync;
