var path = require('path'),
  cp = require('child-process-debug'),
  processHelper = require('./../process-helper.js'),
  log = require('./../log'),
  _ = require('underscore'),
  colors = require('colors'),
  glob = require('glob'),
  fs = require('fs-extra');

/**
 * Mocha Constructor
 *
 * @param {Object} options
 * @api public
 */

function Jasmine(options) {
  this.options = options;
  this.child = null;
}

/**
 * Run Mocha specs
 *
 * @param {Function} callback
 * @api public
 */

Jasmine.prototype.start = function (callback) {

  var self = this;
  if (glob.sync(self.options.path).length === 0) {
    log.info('[chimp][jasmine] Directory', self.options.path, 'does not exist. Not running');
    callback();
    return;
  }

  log.debug('[chimp][jasmine] Running...');

  var opts = {
    env: process.env,
    silent: true
  };

  var port;
  if (this.options.debugJasmine) {
    port = parseInt(this.options.debugJasmine);
    if (port > 1) {
      opts.execArgv = ['--debug=' + port];
    } else {
      opts.execArgv = ['--debug'];
    }
  }

  if (this.options.debugBrkMocha) {
    port = parseInt(this.options.debugBrkMocha);
    if (port > 1) {
      opts.execArgv = ['--debug-brk=' + port];
    } else {
      opts.execArgv = ['--debug-brk'];
    }
  }

  self.child = cp.fork(path.join(__dirname, 'jasmine-wrapper.js'), [], opts);

  self.child.stdout.pipe(process.stdout);
  self.child.stderr.pipe(process.stderr);

  var result = null;
  self.child.on('message', function (res) {
    log.debug('[chimp][jasmine] Received message from Jasmine child. Result:', res);
    result = res;
  });

  self.child.on('close', function (code) {
    log.debug('[chimp][jasmine] Closed with code', code);
    if (!self.child.stopping) {
      log.debug('[chimp][jasmine] Jasmine not in a stopping state');
      callback(code !== 0 ? 'Jasmine failed' : null, result);
    }
  });

};

Jasmine.prototype.interrupt = function (callback) {

  log.debug('[chimp][jasmine] interrupting jasmine');

  var self = this;

  if (!self.child) {
    log.debug('[chimp][jasmine] no child to interrupt');
    return callback();
  }
  self.child.stopping = true;

  var options = {
    child: self.child,
    prefix: 'jasmine'
  };

  processHelper.kill(options, function (err, res) {
    self.child = null;
    if (callback) {
      callback(err, res);
    }
  });

};

module.exports = Jasmine;
