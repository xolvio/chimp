var path = require('path'),
  cp = require('child-process-debug'),
  processHelper = require('./../process-helper.js'),
  booleanHelper = require('../boolean-helper'),
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
    const infoMessage = `[chimp][jasmine] Directory ${self.options.path} does not exist. Not running`;
    if (booleanHelper.isTruthy(this.options['fail-when-no-tests-run'])) {
      callback(infoMessage);
    }
    else {
      log.info(infoMessage);
      callback();
    }
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
  process.stdin.pipe(self.child.stdin);

  let noSpecsFound = false;
  self.child.stdout.on('data', function(data) {
    const colorCodesRegExp = new RegExp(`\x1B\\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]`, 'g');
    const dataFromStdout = data.toString().replace(colorCodesRegExp, '').trim();
    if (/^No specs found/.test(dataFromStdout)) {
      noSpecsFound = true;
    }
  });

  var result = null;
  self.child.on('message', function (res) {
    log.debug('[chimp][jasmine] Received message from Jasmine child. Result:', res);
    result = res;
  });

  self.child.on('close', (code) => {
    log.debug('[chimp][jasmine] Closed with code', code);
    const failWhenNoTestsRun = booleanHelper.isTruthy(self.options['fail-when-no-tests-run']);
    if (!self.child.stopping) {
      log.debug('[chimp][jasmine] Jasmine not in a stopping state');
      callback(code !== 0 || (code === 0 && noSpecsFound && failWhenNoTestsRun) ? 'Jasmine failed' : null, result);
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
