/**
 * Externals
 */
var async     = require('async'),
    path      = require('path'),
    chokidar  = require('chokidar'),
    _         = require('underscore'),
    log       = require('./log'),
    freeport  = require('freeport'),
    DDPClient = require('ddp'),
    Hapi      = require('hapi');

/**
 * Internals
 */
exports.Cucumber = require('./cucumber.js');
exports.Phantom = require('./phantom.js');
exports.Selenium = require('./selenium.js');

/**
 * Exposes the binary path
 *
 * @api public
 */
Chimp.bin = path.resolve(__dirname, path.join('..', 'bin', 'chimp'));

/**
 * Chimp Constructor
 *
 * Options:
 *    - `browser` browser to run tests in
 *
 * @param {Object} options
 * @api public
 */
function Chimp (options) {

  this.chokidar = chokidar;
  this.options = options || {};
  this.processes = [];
  this.isInterrupting = false;

  // store all cli parameters in env hash
  for (var option in options) {
    process.env['chimp.' + option] = options[option];
  }

  process.on('SIGINT', function () {
    log.debug('[chimp] SIGINT detected, killing process');
    process.kill();
  });

}

/**
 * Decides which mode to run and kicks it off
 *
 * @param {Function} callback
 * @api public
 */
Chimp.prototype.init = function (callback) {

  if (this.options.watch) {
    this.watch();
  } else if (this.options.server) {
    this.server();
  } else {
    this.run(callback);
  }

};

/**
 * Watches the file system for changes and reruns when it detects them
 *
 * @api public
 */
Chimp.prototype.watch = function () {

  var watcher = chokidar.watch(this.options.path, {
    ignored: /[\/\\](\.|node_modules)/,
    persistent: true
  });

  var self = this;

  // set cucumber tags to be watch based
  if (!!self.options.watchTags) {
    self.options.tags = self.options.watchTags;
  }

  // wait for initial file scan to complete
  watcher.on('ready', function () {

    log.info('[chimp] Watching features with tagged with', self.options.watchTags);

    // start watching
    watcher.on('all', function (event, path) {

      // removing feature files should not rerun
      if (event === 'unlink' && path.match(/\.feature$/)) {
        return;
      }

      log.debug('[chimp] file changed');
      self.rerun();

    });

    log.debug('[chimp] watcher ready, running for the first time');
    self.rerun();

  });

};



/**
 * Starts a chimp server on a freeport or on options.serverPort if provided
 *
 * @api public
 */
Chimp.prototype.server = function () {
  var self = this;
  if (!this.options.serverPort) {
    freeport(function (error, port) {
      if (error) {
        throw error;
      }
      self._startServer(port);
    });
  } else {
    self._startServer(this.options.serverPort);
  }

};

Chimp.prototype._startServer = function (port) {

  var server = new Hapi.Server();

  server.connection({host: this.options.serverHost, port: port});
  this._setupRoutes(server);

  server.start();

  log.info('[chimp] Chimp server is running on port', port, process.env['chimp.ddp']);

  if (this.options.ddp) {
    this._handshakeOverDDP();
  }

};

Chimp.prototype._handshakeOverDDP = function () {
  var ddp = new DDPClient({
    host: process.env['chimp.ddp'].match(/http:\/\/(.*):/)[1],
    port: process.env['chimp.ddp'].match(/:([0-9]+)/)[1],
    ssl: false,
    autoReconnect: true,
    autoReconnectTimer: 500,
    maintainCollections: true,
    ddpVersion: '1',
    useSockJs: true
  });
  ddp.connect(function (error) {
    if (error) {
      log.error('[chimp] Error handshaking via DDP');
      throw (error);
    }
  }).then(function () {
    log.debug('[chimp] Handshaking with DDP server');
    ddp.call('handshake').then(function () {
      log.debug('[chimp] Handshake complete, closing DDP connection');
      ddp.close();
    });
  });
};

Chimp.prototype._setupRoutes = function (server) {
  var self = this;
  server.route({
    method: 'GET',
    path: '/run',
    handler: function (request, reply) {
      self.rerun(function (err, res) {
        var cucumberResults = res[1][1];
        reply(cucumberResults);
      });
    }
  });
  server.route({
    method: 'GET',
    path: '/run/{absolutePath*}',
    handler: function (request, reply) {
      self.options._[2] = request.params.absolutePath;

      self.rerun(function (err, res) {
        var cucumberResults = res[1][1];
        reply(cucumberResults);
      })
    }
  });
  server.route({
    method: 'GET',
    path: '/interrupt',
    handler: function (request, reply) {
      self.interrupt(function (err, res) {
        reply('done').header('Content-Type', 'application/json');
      });
    }
  });
};



/**
 * Starts servers and runs specs
 *
 * @api public
 */
Chimp.prototype.run = function (callback) {

  log.info('[chimp] Running...');

  var self = this;

  async.series([
    self.interrupt.bind(self),
    self._startProcesses.bind(self),
    self.interrupt.bind(self)
  ], callback);

};

/**
 * Interrupts any running specs in the reverse order. This allows cucumber to shut down first
 * before webdriver servers, otherwise we can get test errors in the console
 *
 * @api public
 */
Chimp.prototype.interrupt = function (callback) {

  log.debug('[chimp] interrupting');

  var self = this;

  self.isInterrupting = true;

  if (!self.processes || self.processes.length === 0) {
    self.isInterrupting = false;
    log.debug('[chimp] no processes to interrupt');
    callback();
    return;
  }

  log.debug('[chimp]', self.processes.length, 'processes to interrupt');

  var reverseProcesses = [];
  while (self.processes.length !== 0) {
    reverseProcesses.push(self.processes.pop());
  }

  var processes = _.collect(reverseProcesses, function (process) {
    return process.interrupt.bind(process)
  });

  async.series(processes, function (error, r) {
    self.isInterrupting = false;
    log.debug('[chimp] Finished interrupting processes');
    if (error) {
      log.error('[chimp] with errors', error);
    }
    callback.apply(this, arguments);
  });

};

/**
 * Combines the interrupt and run methods and latches calls
 *
 * @api public
 */
Chimp.prototype.rerun = function (callback) {

  log.debug('[chimp] rerunning');

  var self = this;

  if (self.isInterrupting) {
    log.debug('[chimp] interrupt in progress, ignoring rerun');
    return;
  }

  self.run(function (err, res) {
    if (callback) {
      callback(err, res);
    }
    log.debug('[chimp] finished rerun');
  });
};

/**
 * Starts processes in series
 *
 * @api private
 */
Chimp.prototype._startProcesses = function (callback) {

  var self = this;

  self.processes = self._createProcesses();

  var processes = _.collect(self.processes, function (process) {
    return process.start.bind(process)
  });

  // pushing at least one processes guarantees the series below runs
  processes.push(function (callback) {
    log.debug('[chimp] Finished running async processes');
    callback();
  });

  async.series(processes, function (err, res) {
    if (err) {
      self.isInterrupting = false;
      log.error('[chimp] Finished running async processes with errors');
    }
    callback(err, res);
  });

};

/**
 * Creates the correct sequence of servers needed prior to running cucumber
 *
 * @api private
 */
Chimp.prototype._createProcesses = function () {

  var processes = [];

  if (this.options.browser === 'phantomjs') {
    var phantom = new exports.Phantom(this.options);
    processes.push(phantom);
  }

  else if (!this.options.host.match(/saucelabs/)) {
    var selenium = new exports.Selenium(this.options);
    processes.push(selenium);
  }

  var cucumber = new exports.Cucumber(this.options);
  processes.push(cucumber);

  return processes;

};

module.exports = Chimp;
