var cp  = require('child_process'),
    log = require('loglevel');

module.exports = {

  start: function (options, callback) {

    var child = this.spawn(options);

    if (options.waitForMessage) {
      this.waitForMessage(options, child, callback);
    } else {
      callback();
    }

    return child;
  },

  spawn: function (options) {
    log.debug(options.prefix, 'starting process');

    var child = cp.spawn(options.bin, options.args);

    this.logOutputs(options.prefix, child);

    return child;
  },

  logOutputs: function (prefix, child) {
    child.stdout.on('data', function (data) {
      log.debug(prefix, data.toString());
    });
    child.stderr.on('data', function (data) {
      log.error(prefix, data.toString());
    });
  },

  waitForMessage: function (options, child, callback) {
    child.stdout.on('data', function onData (data) {
      log.debug(options.prefix, data.toString());
      if (data.toString().match(options.waitForMessage)) {
        child.stdout.removeListener('data', onData);
        log.debug(options.prefix, 'started successfully');
        callback();
        return;
      }
      if (data.toString().match(options.errorMessage)) {
        log.error(options.prefix, 'failed to start');
        log.error(data);
        callback(data);
      }
    });
  },

  kill: function (options, callback) {

    log.debug(options.prefix, 'killing child process with pid', options.child.pid);

    process.kill(options.child.pid);

    var waitForProcessToDie = setInterval(function () {
      try {
        process.kill(options.child.pid, 0);
      } catch (e) {
        options.child = null;
        clearInterval(waitForProcessToDie);
        callback();
      }
    }, 100);
  }

};