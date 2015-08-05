// A wrapped webdriverio with synchronous API using fibers.

var webdriverio = require('webdriverio');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var wrapAsyncObject = require('./fiber-utils').wrapAsyncObject;
var wrapAsync = require('./fiber-utils').wrapAsync;

var wrapAsyncForWebdriver = function (fn, context) {
  return wrapAsync(fn, context, {supportCallback: false});
};

var webdriverioWithSync = _.clone(webdriverio);

webdriverioWithSync.remote = function (options) {
  var syncByDefault = !(options && options.sync === false);

  var remote = webdriverio.remote.apply(webdriverio, arguments);

  // Wrap async added commands
  var addCommand = remote.addCommand;
  remote.addCommand = function (fnName, fn, forceOverwrite) {
    var result = addCommand.apply(this, arguments);
    wrapAsyncObject(remote, [fnName], {
      syncByDefault: syncByDefault,
      wrapAsync: wrapAsyncForWebdriver
    });
    return result;
  };

  // Wrap async all core commands
  ['protocol', 'commands'].forEach(function(commandType) {
    var dir = path.resolve(
      __dirname,
      path.join('..', 'node_modules', 'webdriverio', 'lib', commandType)
    );
    var files = fs.readdirSync(dir);

    var commandNames = files.map(function(filename) {
      return filename.slice(0, -3);
    });
    wrapAsyncObject(remote, commandNames, {
      syncByDefault: syncByDefault,
      wrapAsync: wrapAsyncForWebdriver
    });
  });

  return remote;
};

module.exports = webdriverioWithSync;
