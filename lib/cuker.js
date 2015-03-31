/*!
 * cuker
 */

/**
 * Externals
 */

var async = require('async');

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

function Cuker(options) {
  this.options = options;

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

Cuker.prototype.run = function(callback) {
  var processes = [],
      cucumber = new exports.Cucumber(this.options);

  // phantom
  if (this.options.browser === 'phantomjs') {
    var phantom = new exports.Phantom(this.options);
    processes.push(phantom.run.bind(phantom));
  }

  // selenium
  else if (!this.options.host.match(/saucelabs/)) {
    var selenium = new exports.Selenium(this.options);
    processes.push(selenium.run.bind(selenium));
  }

  // run cucumber
  processes.push(cucumber.run.bind(cucumber));

  // run processes
  async.series(processes, function(err, results) {
    if (err) {
      callback(err, results);
    } else {
      callback(null, results);
    }
  });
};

module.exports = Cuker;
