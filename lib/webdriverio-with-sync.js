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

    var commandNames = files.map(function(filename) {
      return filename.slice(0, -3);
    });
    var syncByDefault = !(options && options.sync === false);
    fiberUtils.wrapAsyncObject(remote, commandNames, syncByDefault);
  });

  return remote;
};

module.exports = webdriverioWithSync;
