var cp  = require('child_process'),
    log = require('./log');

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
    log.debug('[cuke-monkey][' + options.prefix + ']', 'starting process');

    var child = cp.spawn(options.bin, options.args);

    this.logOutputs(options.prefix, child);

    return child;
  },

  logOutputs: function (prefix, child) {
    child.stdout.on('data', function (data) {
      log.debug('[cuke-monkey][' + prefix + '.stdout]', data.toString());
    });
    child.stderr.on('data', function (data) {
      log.debug('[cuke-monkey][' + prefix + '.stderr]', data.toString());
    });
  },

  waitForMessage: function (options, child, callback) {
    child.stdout.on('data', function onData (data) {
      if (data.toString().match(options.waitForMessage)) {
        child.stdout.removeListener('data', onData);
        log.debug('[cuke-monkey][' + options.prefix + ']', 'started successfully');
        return callback();
      }
      if (data.toString().match(options.errorMessage)) {
        log.error('[cuke-monkey][' + options.prefix + ']', 'failed to start');
        log.error(data.toString());
        callback(data.toString());
      }
    });
  },

  kill: function (options, callback) {

    log.debug('[cuke-monkey][' + options.prefix + ']', 'killing child process with pid', options.child.pid);

    try {
      process.kill(options.child.pid, 0);
      process.kill(options.child.pid);
    } catch (e) {
      options.child = null;
      return callback();
    }

    var delay = 100,
        retries = 10 * (1000 / delay);

    var waitForProcessToDie = setInterval(function () {
      try {
        if (retries-- < 0) {
          throw new Error('Process took too long to die')
        }
        process.kill(options.child.pid, 0);
      } catch (e) {
        clearInterval(waitForProcessToDie);
        if (e.code === 'ESRCH') {
          options.child = null;
          callback();
        } else {
          callback(e);
        }
      }
    }, delay);
  }

};