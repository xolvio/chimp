/*!
 * cuker
 */

/**
 * Externals
 */

var async = require('async'),
path      = require('path'),
chokidar  = require('chokidar');

/**
 * Internals
 */

exports.Cucumber = require('./cucumber.js');
exports.Phantom = require('./phantom.js');
exports.Selenium = require('./selenium.js');

/**
 * Cuker Constructor
 *
 * Options:
 *    - `browser` browser to run tests in
 *
 * @param {Object} options
 * @api public
 */

function Cuker (options) {
  this.options = options;
  this.interruptSequence = [];

  // store all cli parameters in env hash
  for (var option in options) {
    process.env["cuker." + option] = options[option];
  }
}

/**
 * Setup environment and run tests
 *
 * @param {Function} callback
 * @api public
 */

Cuker.prototype.start = function (callback) {

  if (this.options.watch) {
    this.watch();
  } else {
    this.run(callback);
  }

};

Cuker.prototype.watch = function () {

  var watcher = chokidar.watch(this.options.path, {
    ignored: /[\/\\]\./,
    persistent: true
  });

  var self = this;


  var cucumber = new exports.Cucumber(this.options);

  // wait for initial file scan to complete
  watcher.on('ready', function () {

    console.log('[cuke-monkey] is watching your files');

    // start watching
    this.on('all', function (event, path) {

      // removing feature files should not rerun
      if (event === 'unlink' && path.match(/\.feature$/)) {
        return;
      }

      self.interrupt(function () {
        self.run(function (err, res) {
          if (err) {
            console.error('Failed.');
          }
        });
      });

    });

    self.run(function (err, res) {
      if (err) {
        console.error('Failed.');
      }
    });


  });

};

Cuker.prototype.run = function (callback) {
  var self = this,
      processes = [],
      cucumber = new exports.Cucumber(self.options);

  console.log('[cuke-monkey] is running');

  self.interruptSequence = [cucumber.interrupt];

  // phantom
  if (self.options.browser === 'phantomjs') {
    var phantom = new exports.Phantom(self.options);
    processes.push(phantom.run.bind(phantom));
    this.interruptSequence.push(phantom.interrupt);
  }

  // selenium
  else if (!self.options.host.match(/saucelabs/)) {
    var selenium = new exports.Selenium(self.options);
    processes.push(selenium.run.bind(selenium));
    self.interruptSequence.push(selenium.interrupt);
  }

  // run cucumber
  processes.push(cucumber.run.bind(cucumber));

  // run processes
  async.series(processes, function (err, results) {
    self.interrupt(function () {
      self.interruptSequence = [];
      if (!callback) {
        return;
      }
      if (err) {
        callback(err, results);
      } else {
        callback(null, results);
      }
    }, true);
  });
};

Cuker.prototype.interrupt = function (callback) {
  this.interruptSequence.push(function () {
    callback();
  });
  async.series(this.interruptSequence);
};


Cuker.bin = path.resolve(__dirname, path.join('..', 'bin', 'cuke-monkey'));

module.exports = Cuker;
