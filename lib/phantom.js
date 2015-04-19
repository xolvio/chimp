var path      = require('path'),
    freeport  = require('freeport'),
    async     = require('async'),
    phantomjs = require('phantomjs-bin'),
    cp        = require('child_process');

/**
 * Phantom Constructor
 *
 * @param {Object} options
 * @api public
 */

function Phantom (options) {
  this.options = options;
}

/**
 * Run Phantom
 *
 * @param {Object} options
 * @api public
 */

Phantom.prototype.run = function (callback) {

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
      var phantomProcess = cp.spawn(phantomjs.path, ['--webdriver', port]);

      phantomProcess.stdout.on('data', function onPhantomData (data) {
        if (data.toString().match(/GhostDriver - Main - running on port/)) {
          phantomProcess.stdout.removeListener('data', onPhantomData);
          callback();
        }
        if (data.toString().match(/Error/)) {
          process.stderr.write(data);
          callback();
        }

      });

      phantomProcess.stderr.pipe(process.stdout);

      var killPhantomAndDie = function () {
        if (!!phantomProcess && !phantomProcess.killed) {
          phantomProcess.kill('SIGTERM');
          phantomProcess.killed = true;
        }
        process.exit();
      };
      process.on('SIGTERM', killPhantomAndDie);
      process.on('exit', killPhantomAndDie);

    }

  ], callback);

};

module.exports = Phantom;
