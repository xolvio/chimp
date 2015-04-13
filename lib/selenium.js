// This must happen before we require selenium-launcher
if (!process.env.SELENIUM_VERSION) {
  process.env.SELENIUM_VERSION ='2.45.0:9bc872d1f364a3104257b1f8e055a342228259c3';
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
