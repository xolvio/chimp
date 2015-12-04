var path          = require('path'),
    cp            = require('child-process-debug'),
    processHelper = require('./../process-helper.js'),
    log           = require('./../log'),
    _             = require('underscore'),
    colors        = require('colors'),
    glob          = require('glob'),
    fs            = require('fs-extra');

/**
 * Mocha Constructor
 *
 * @param {Object} options
 * @api public
 */

function Mocha (options) {
  this.options = options;
  this.mochaChild = null;
}

/**
 * Run Mocha specs
 *
 * @param {Function} callback
 * @api public
 */

Mocha.prototype.start = function (callback) {

  var self = this;
  if (glob.sync(self.options.path).length === 0) {
    log.info('[chimp][mocha] Directory', self.options.path, 'does not exist. Not running');
    callback();
    return;
  }

  log.debug('[chimp][mocha] Running...');

  var opts = {
    env: process.env,
    silent: true
  };

  var port;
  if (this.options.debugMocha) {
    port = parseInt(this.options.debugMocha);
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

  self.mochaChild = cp.fork(path.join(__dirname, 'mocha-wrapper.js'), [
    '--color'
  ], opts);

  self.mochaChild.stdout.pipe(process.stdout);
  self.mochaChild.stderr.pipe(process.stderr);

  var result = null;
  self.mochaChild.on('message', function (res) {
    log.debug('[chimp][mocha] Received message from Mocha child. Result:', res);
    result = res;
  });

  self.mochaChild.on('close', function (code) {
    log.debug('[chimp][mocha] Closed with code', code);
    if (!self.mochaChild.stopping) {
      log.debug('[chimp][mocha] Mocha not in a stopping state');
      callback(code !== 0 ? 'Mocha failed' : null, result);
    }
  });

};

Mocha.prototype.interrupt = function (callback) {

  log.debug('[chimp][mocha] interrupting mocha');

  var self = this;

  if (!self.mochaChild) {
    log.debug('[chimp][mocha] no child to interrupt');
    return callback();
  }
  self.mochaChild.stopping = true;

  var options = {
    child: self.mochaChild,
    prefix: 'mocha'
  };

  processHelper.kill(options, function (err, res) {
    self.mochaChild = null;
    if (callback) {
      callback(err, res);
    }
  });

};

module.exports = Mocha;
