var cp = require('child_process'),
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
    log.debug('[chimp][' + options.prefix + ']', 'starting process');

    var child = cp.spawn(options.bin, options.args);

    this.logOutputs(options.prefix, child);

    return child;
  },

  logOutputs: function (prefix, child) {
    child.stdout.on('data', function (data) {
      log.debug('[chimp][' + prefix + '.stdout]', data.toString());
    });
    child.stderr.on('data', function (data) {
      log.debug('[chimp][' + prefix + '.stderr]', data.toString());
    });
  },

  waitForMessage: function (options, child, callback) {
    child.stdout.on('data', function onData(data) {
      if (data.toString().match(options.waitForMessage)) {
        child.stdout.removeListener('data', onData);
        log.debug('[chimp][' + options.prefix + ']', 'started successfully');
        return callback();
      }
      if (data.toString().match(options.errorMessage)) {
        log.error('[chimp][' + options.prefix + ']', 'failed to start');
        log.error(data.toString());
        callback(data.toString());
      }
    });
  },

  kill: function (options, callback) {

    log.debug('[chimp][' + options.prefix + ']', 'kill called on ' + options.prefix + ' process with pid', options.child.pid);

    options.signal = options.signal || 'SIGTERM';

    try {
      log.debug('[chimp][' + options.prefix + ']', 'checking if process exists');
      process.kill(options.child.pid, 0);
      log.debug('[chimp][' + options.prefix + ']', options.prefix + ' process exists, killing it with', options.signal);
      process.kill(options.child.pid, options.signal);
    } catch (e) {
      log.debug('[chimp][' + options.prefix + ']', options.prefix + ' process does not exists, ignoring');
      options.child = null;
      return callback();
    }

    var delay = 300,
      totalRetries = 10,
      retries = totalRetries * (1000 / delay),
      attempt = 0;

    var waitForProcessToDie = setInterval(function () {
      try {
        if (retries-- < 0) {
          throw new Error('Process took too long to die');
        }
        log.debug('[chimp][' + options.prefix + ']', 'waiting for process to die (' + attempt++ + '/' + totalRetries + ')');
        process.kill(options.child.pid, 0);
      } catch (e) {
        clearInterval(waitForProcessToDie);
        if (e.code === 'ESRCH') {
          log.debug('[chimp][' + options.prefix + ']', 'process is dead');
          options.child = null;
          callback();
        } else {
          callback(e);
        }
      }
    }, delay);
  }

};
