var path          = require('path'),
    freeport      = require('freeport'),
    async         = require('async'),
    phantomjs     = require('phantomjs-bin'),
    cp            = require('child_process'),
    _phantomChild = null;

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
      _phantomChild = cp.spawn(phantomjs.path, ['--webdriver', port]);

      _phantomChild.stdout.on('data', function onPhantomData (data) {
        if (data.toString().match(/GhostDriver - Main - running on port/)) {
          _phantomChild.stdout.removeListener('data', onPhantomData);
          callback();
        }
        if (data.toString().match(/Error/)) {
          process.stderr.write(data);
          callback();
        }

      });

      _phantomChild.stderr.pipe(process.stdout);

    }

  ], callback);

};


Phantom.prototype.interrupt = function (callback) {

  if (!_phantomChild) {
    return;
  }

  try {
    process.kill(_phantomChild.pid);
  } catch (e) {
    return;
  }

  if (callback) {
    var waitForProcessToDie = setInterval(function () {
      try {
        process.kill(_phantomChild.pid, 0);
      } catch (e) {
        _phantomChild = null;
        clearInterval(waitForProcessToDie);
        callback();
      }
    }, 100);
  }
};


module.exports = Phantom;
