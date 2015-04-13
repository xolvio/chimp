// This must happen before we require selenium-launcher
if (!process.env.SELENIUM_VERSION) {
  process.env.SELENIUM_VERSION ='2.45.0:a62db4c36e230a936455aaacda9340a8';
}

var selenium_launcher = require('selenium-launcher');

/**
* Selenium Constructor
*
* @param {Object} options
* @api public
*/

function Selenium(options) {
  this.options = options;
}

/**
* Run Selenium process
*
* @param {Function} callback
* @api public
*/

Selenium.prototype.run = function(callback) {
  selenium_launcher(function(err, selenium) {
    if (err) {
      return callback(err);
    }

    // store created host and port
    process.env['cuker.host'] = selenium.host;
    process.env['cuker.port'] = selenium.port;

    process.on('exit', function () {
      selenium.kill();
    });

    callback();
  });

};

module.exports = Selenium;
