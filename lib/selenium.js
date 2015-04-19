var selenium = require('selenium-standalone'),
    freeport = require('freeport'),
    async    = require('async');

function isDebugging () {
  return process.env['cuker.debug'] &&
    process.env['cuker.debug'] !== 'false';
}

/**
 * Selenium Constructor
 *
 * @param {Object} options
 * @api public
 */

function Selenium (options) {
  this.options = options;
}

/**
 * Installs Selenium and drivers.
 *
 * @param {Function} callback
 * @api public
 */

Selenium.prototype.install = function (callback) {
  var ProgressBar = require('progress');
  var bar;
  var firstProgress = true;

  selenium.install({
    // check for more recent versions of selenium here:
    // http://selenium-release.storage.googleapis.com/index.html
    version: '2.45.0',
    baseURL: 'http://selenium-release.storage.googleapis.com',
    drivers: {
      chrome: {
        // check for more recent versions of chrome driver here:
        // http://chromedriver.storage.googleapis.com/index.html
        version: '2.15',
        arch: process.arch,
        baseURL: 'http://chromedriver.storage.googleapis.com'
      },
      ie: {
        // check for more recent versions of internet explorer driver here:
        // http://selenium-release.storage.googleapis.com/index.html
        version: '2.45',
        arch: process.arch,
        baseURL: 'http://selenium-release.storage.googleapis.com'
      }
    },
    logger: function (message) {
      if (isDebugging()) {
        console.log('[selenium] ' + message);
      }
    },
    progressCb: progressCb
  }, callback);

  function progressCb (total, progress, chunk) {
    if (firstProgress) {
      console.log('');
      console.log('');
      firstProgress = false;
    }

    bar = bar || new ProgressBar(
      'selenium-standalone installation [:bar] :percent :etas', {
        total: total,
        complete: '=',
        incomplete: ' ',
        width: 20
      });

    bar.tick(chunk);
  }
};

/**
 * Run Selenium process.
 *
 * It also installs Selenium if necessary.
 *
 * @param {Function} callback
 * @api public
 */

Selenium.prototype.run = function (callback) {

  var self = this;

  // XXX rule of 3. both phantom and selenium have this code. If we use it a 3rd time with
  // ChromeDriver, this code should be generalized
  async.waterfall([

    function (callback) {
      if (self.options.port) {
        callback(null, self.options.port);
      } else {
        freeport(function (err, port) {
          process.env['cuker.port'] = port;
          callback(null, port);
        })
      }
    },

    function (port, callback) {

      self.install(function (error) {
        if (error) {
          callback(error);
          return;
        }

        var seleniumOptions = {
          seleniumArgs: [
            '-port', port
          ]
        };

        selenium.start(seleniumOptions, function (error, seleniumChild) {
          if (error) {
            callback(error);
            return;
          }

          if (isDebugging()) {
            seleniumChild.stderr.on('data', function (data) {
              process.stdout.write('[selenium] ' + data.toString());
            });
          }

          var closeBrowsersAndExitAll = function () {

            if (!seleniumChild || seleniumChild.killed) {
              return;
            }

            var exitAll = function () {
              seleniumChild.kill('SIGTERM');
              seleniumChild.killed = true;
              process.exit();
            };

            if (global.browser) {
              global.browser.endAll(exitAll);
            } else {
              exitAll();
            }

          };
          process.on('SIGTERM', closeBrowsersAndExitAll);
          process.on('exit', closeBrowsersAndExitAll);

          callback();

        });
      });

    }

  ], callback);

};

module.exports = Selenium;
