// A wrapped webdriverio with synchronous API using fibers.

var webdriverio = require('webdriverio');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var fiberUtils = require('./fiber-utils');

var webdriverioWithSync = _.clone(webdriverio);

webdriverioWithSync.remote = function (options) {
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
      remote[commandName + 'Sync'] = fiberUtils.wrapAsync(remote[commandName], remote);
      if (!(options && options.sync === false)) {
        remote[commandName] = remote[commandName + 'Sync'];
      }
    });
  });

  return remote;
};

module.exports = webdriverioWithSync;
