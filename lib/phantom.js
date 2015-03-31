var path     = require('path'),
    freeport = require('freeport'),
    async    = require('async'),
    cp       = require('child_process');

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
      var phantomBinPath = path.resolve(__dirname, '../node_modules/.bin/phantomjs'),
          phantomProcess = cp.spawn(phantomBinPath, ['--webdriver', port]);

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

      process.on('exit', function () {
        phantomProcess.kill();
      });
    }

  ], callback);

};

module.exports = Phantom;
