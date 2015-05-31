var path          = require('path'),
    cp            = require('child_process'),
    processHelper = require('./process-helper.js'),
    log           = require('./log'),
    fs            = require('fs-extra');

/**
 * Cucumber Constructor
 *
 * @param {Object} options
 * @api public
 */

function Cucumber (options) {
  this.options = options;
  this.cucumberChild = null;
}

/**
 * Run Cucumber specs
 *
 * @param {Function} callback
 * @api public
 */

Cucumber.prototype.start = function (callback) {

  var self = this,
      execOptions = _getExecOptions(self.options);

  if (!fs.existsSync(self.options.path)) {
    log.info('[chimp][cucumber] Directory', self.options.path, 'does not exist. Not running');
    callback();
    return;
  }

  log.debug('[chimp][cucumber] Running');

  self.cucumberChild = cp.fork(path.join(__dirname, 'cucumber-wrapper.js'), execOptions, {
    env: process.env
  });

  var jsonResults = null;
  self.cucumberChild.on('message', function (res) {
    jsonResults = res;
  });

  self.cucumberChild.on('close', function (code) {
    log.debug('[chimp][cucumber] Closed with code', code);

    if (!self.cucumberChild.stopping) {

      var result = jsonResults;
      if (self.options.jsonOutput) {
        var dir = path.dirname(self.options.jsonOutput);
        log.debug('[chimp][cucumber] Ensuring directory exists', dir);
        fs.mkdirsSync(dir);
        log.debug('[chimp][cucumber] Writing json results to', self.options.jsonOutput);
        fs.writeFileSync(self.options.jsonOutput, jsonResults);
        log.debug('[chimp][cucumber] Finished writing results');
      }

      callback(code !== 0 ? 'Cucumber steps failed' : null, result);
    }
  });

};

Cucumber.prototype.interrupt = function (callback) {

  log.debug('[chimp][cucumber] interrupting cucumber');

  var self = this;

  if (!self.cucumberChild) {
    log.debug('[chimp][cucumber] no child to interrupt');
    return callback();
  }
  self.cucumberChild.stopping = true;

  var options = {
    child: self.cucumberChild,
    prefix: 'cucumber'
  };

  processHelper.kill(options, function (err, res) {
    self.cucumberChild = null;
    if (callback) {
      callback(err, res);
    }
  });

};

function _getExecOptions (options) {
  var execOptions = ['node', path.resolve(__dirname, path.join('..', 'node_modules', '.bin', 'cucumber.js'))];

  // XXX a feature may be defined at the start or end
  // XXX do other options also get passed with this command?
  var features = options._.splice(2).toString();

  if (features) {
    execOptions.push(features);
  }

  execOptions.push('-r');
  execOptions.push(options.path);
  execOptions.push('-r');
  execOptions.push(path.resolve(__dirname, 'cucumberjs', path.join('world.js')));
  execOptions.push('-r');
  execOptions.push(path.resolve(__dirname, 'cucumberjs', path.join('hooks.js')));

  var allowedCucumberJsOptions = {
    long: ['require', 'format', 'progress', 'tags', 'help', 'strict', 'version', 'coffee', 'snippets'],
    short: ['r', 'f', 't', 'h', 'S', 'i']
  };

  for (var option in options) {
    if (allowedCucumberJsOptions.long.indexOf(option) !== -1) {
      execOptions.push('--' + option);
      execOptions.push(options[option].toString());
    }
    if (allowedCucumberJsOptions.short.indexOf(option) !== -1) {
      execOptions.push('-' + option);
      execOptions.push(options[option].toString());
    }
  }

  return execOptions;
}

module.exports = Cucumber;
