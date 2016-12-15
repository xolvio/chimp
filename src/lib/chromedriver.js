var chromedriver = require('chromedriver'),
    processHelper = require('./process-helper.js'),
    log = require('./log');

/**
 * Chromedriver Constructor
 *
 * @param {Object} options
 * @api public
 */
function Chromedriver(options) {
    if (!options) {
        throw new Error('options is required');
    }

    if (!options.port) {
        throw new Error('options.port is required');
    }

    this.options = options;

    this.child = null;
}


/**
 * Start Chromedriver
 *
 * @param {Function} callback
 * @api public
 */
Chromedriver.prototype.start = function (callback) {
    var self = this;
    var port = self.options.port;

    if (this.child) {
        callback();
        return;
    }

    this.child = processHelper.start({
        bin: chromedriver.path,
        prefix: 'chromedriver',
        args: ['--port=' + port, '--url-base=wd/hub'],
        waitForMessage: /Starting ChromeDriver/,
        errorMessage: /Error/
    }, callback);

};

/**
 * Stop Chromedriver
 *
 * @param {Function} callback
 * @api public
 */
Chromedriver.prototype.stop = function (callback) {
    var self = this;

    if (self.child) {
        log.debug('[chimp][chromedriver] stopping process');

        var options = {
            child: self.child,
            prefix: 'chromedriver'
        };

        processHelper.kill(options, function (err, res) {
            self.child = null;
            callback(err, res);
        });

    } else {
        log.debug('[chimp][chromedriver] no process to kill');
        callback(null);
    }

};

/**
 * Interrupt Chromedriver
 *
 * @param {Function} callback
 * @api public
 */
Chromedriver.prototype.interrupt = function (callback) {
  log.debug('[chimp][chromedriver] interrupt called');
  if (!this.options['watch'] || !!this.options['clean-chromedriver-server']) {
    this.stop(callback);
  } else {
    log.debug('[chimp][chromedriver] interrupt is not killing chromedriver because ' +
      'clean-chromedriver-server not set');
    callback(null);
  }
};



module.exports = Chromedriver;
