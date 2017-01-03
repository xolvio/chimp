/**
 * Externals
 */
var async = require('async'),
  path = require('path'),
  chokidar = require('chokidar'),
  _ = require('underscore'),
  log = require('./log'),
  freeport = require('freeport'),
  DDPClient = require('xolvio-ddp'),
  fs = require('fs'),
  Hapi = require('hapi'),
  AutoupdateWatcher = require('./ddp-watcher'),
  colors = require('colors'),
  booleanHelper = require('./boolean-helper');

colors.enabled = true;
var DEFAULT_COLOR = 'yellow';

/**
 * Internals
 */
exports.Mocha = require('./mocha/mocha.js');
exports.Jasmine = require('./jasmine/jasmine.js');
exports.Cucumber = require('./cucumberjs/cucumber.js');
exports.Phantom = require('./phantom.js');
exports.Chromedriver = require('./chromedriver.js');
exports.Consoler = require('./consoler.js');
exports.Selenium = require('./selenium.js');
exports.SimianReporter = require('./simian-reporter.js');

/**
 * Exposes the binary path
 *
 * @api public
 */
Chimp.bin = path.resolve(__dirname, path.join('..', 'bin', 'chimp'));

Chimp.install = function (callback) {
  log.debug('[chimp]', 'Installing dependencies');
  new exports.Selenium({port: '1'}).install(callback);
};

/**
 * Chimp Constructor
 *
 * Options:
 *    - `browser` browser to run tests in
 *
 * @param {Object} options
 * @api public
 */
function Chimp(options) {

  this.chokidar = chokidar;
  this.options = options || {};
  this.processes = [];
  this.isInterrupting = false;
  this.exec = require('child_process').exec;
  this.fs = fs;
  this.testRunnerRunOrder = [];

  // store all cli parameters in env hash
  // Note: Environment variables are always strings.
  for (var option in options) {
    if (option === 'ddp') {
      handleDdpOption(options);
    } else {
      process.env['chimp.' + option] = _.isObject(options[option]) ?
       JSON.stringify(options[option]) :
       String(options[option]);
    }
  }

  this._handleMeteorInterrupt();
}

function handleDdpOption(options) {
  if (typeof options.ddp === 'string') {
    process.env['chimp.ddp0'] = String(options.ddp);
    return;
  }
  if (Array.isArray(options.ddp)) {
    options.ddp.forEach(function(val, index){
      process.env['chimp.ddp' + index] = String(val);
    });
  }
}

/**
 * Runs an npm install then calls selectMode
 *
 * @param {Function} callback
 * @api public
 */
Chimp.prototype.init = function (callback) {
  var self = this;

  this.informUser();

  try {
    this._initSimianResultBranch();
    this._initSimianBuildNumber();
  } catch (error) {
    callback(error);
    return;
  }
  self.selectMode(callback);
};

Chimp.prototype.informUser = function () {

  if (this.options.showXolvioMessages) {
    log.info('\nMaster Chimp and become a testing Ninja! Check out our course: '.green + 'http://bit.ly/2btQaFu\n'.blue.underline);
  }

  if (booleanHelper.isTruthy(this.options.criticalSteps)) {
    this.options.e2eSteps = this.options.criticalSteps;
    log.warn('[chimp] Please use e2eSteps instead of criticalSteps. criticalSteps is now deprecated.'.red);
  }

  if (booleanHelper.isTruthy(this.options.criticalTag)) {
    this.options.e2eTags = this.options.criticalTag;
    log.warn('[chimp] Please use e2eTags instead of criticalTag. criticalTag is now deprecated.'.red);
  }

  if (booleanHelper.isTruthy(this.options.mochaTags)
    || booleanHelper.isTruthy(this.options.mochaGrep)
    || booleanHelper.isTruthy(this.options.mochaTimeout)
    || booleanHelper.isTruthy(this.options.mochaReporter)
    || booleanHelper.isTruthy(this.options.mochaSlow)) {
    log.warn('[chimp] mochaXYZ style configs are now deprecated. Please use a mochaConfig object.'.red);
  }
};


Chimp.prototype._initSimianResultBranch = function () {
  // Automatically set the result branch for the common CI tools
  if (this.options.simianAccessToken &&
    this.options.simianResultBranch === null
  ) {
    if (booleanHelper.isTruthy(process.env.CI_BRANCH)) {
      // Codeship or custom
      this.options.simianResultBranch = process.env.CI_BRANCH;
    } else if (booleanHelper.isTruthy(process.env.CIRCLE_BRANCH)) {
      // CircleCI
      this.options.simianResultBranch = process.env.CIRCLE_BRANCH;
    } else if (booleanHelper.isTruthy(process.env.TRAVIS_BRANCH)) {
      // TravisCI
      if (booleanHelper.isFalsey(process.env.TRAVIS_PULL_REQUEST)) {
        this.options.simianResultBranch = process.env.TRAVIS_BRANCH;
      } else {
        // Ignore the builds that simulate the pull request merge,
        // because the branch will be the target branch.
        this.options.simianResultBranch = false;
      }
    } else {
      throw new Error(
        'You have not specified the branch that should be reported to Simian!' +
        ' Do this with the --simianResultBranch argument' +
        ' or the CI_BRANCH environment variable.'
      );
    }
  }
};

Chimp.prototype._initSimianBuildNumber = function _initSimianBuildNumber() {
  // Automatically set the result branch for the common CI tools
  if (this.options.simianAccessToken) {
    if (process.env.CI_BUILD_NUMBER) {
      // Codeship or custom
      this.options.simianBuildNumber = process.env.CI_BUILD_NUMBER;
    } else if (process.env.CIRCLE_BUILD_NUM) {
      // CircleCI
      this.options.simianBuildNumber = process.env.CIRCLE_BUILD_NUM;
    } else if (process.env.TRAVIS_BUILD_NUMBER) {
      // TravisCI
      this.options.simianBuildNumber = process.env.TRAVIS_BUILD_NUMBER;
    }
  }
};

/**
 * Decides which mode to run and kicks it off
 *
 * @param {Function} callback
 * @api public
 */
Chimp.prototype.selectMode = function (callback) {

  if (booleanHelper.isTruthy(this.options.watch)) {
    this.watch();
  } else if (booleanHelper.isTruthy(this.options.server)) {
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

  var self = this;

  var watchDirectories = [];
  if (self.options.watchSource) {
    watchDirectories = (self.options.watchSource.split(','));
  }

  if (self.options.e2eSteps) {
    watchDirectories.push(self.options.e2eSteps);
  }

  if (self.options.domainSteps) {
    watchDirectories.push(self.options.domainSteps);
  }

  watchDirectories.push(self.options.path);

  var watcher = chokidar.watch(watchDirectories, {
    ignored: /[\/\\](\.|node_modules)/,
    persistent: true,
    usePolling: this.options.watchWithPolling
  });

  // set cucumber tags to be watch based
  if (booleanHelper.isTruthy(self.options.watchTags)) {
    self.options.tags = self.options.watchTags;
  }

  if (booleanHelper.isTruthy(self.options.ddp)) {
    var autoUpdateWatcher = new AutoupdateWatcher(self.options);
    autoUpdateWatcher.watch(function () {
      log.debug('[chimp] Meteor autoupdate detected');
      self.rerun();
    });
  }

  // wait for initial file scan to complete
  watcher.once('ready', function () {

    var watched = [];
    if (self.options.watchTags) {
      watched.push(self.options.watchTags.split(','));
    }
    log.info(`[chimp] Watching features with tagged with ${watched.join()}`.white);

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

  server.connection({
    host: this.options.serverHost,
    port: port,
    routes: {timeout: {server: false, socket: false}}
  });

  this._setupRoutes(server);

  server.start();

  log.info('[chimp] Chimp server is running on port', port, process.env['chimp.ddp']);

  if (booleanHelper.isTruthy(this.options.ddp)) {
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

Chimp.prototype._parseResult = function (res) {
  // FIXME this is shitty, there's got to be a nicer way to deal with variable async chains
  var cucumberResults = res[1][1] ? res[1][1] : res[1][0];
  if (!cucumberResults) {
    log.error('[chimp] Could not get Cucumber Results from run result:');
    log.error(res);
  }
  log.debug('[chimp] Responding to /run request with:');
  log.debug(cucumberResults);
  return cucumberResults;
};

Chimp.prototype._setupRoutes = function (server) {
  var self = this;
  server.route({
    method: 'GET',
    path: '/run',
    handler: function (request, reply) {
      self.rerun(function (err, res) {
        var cucumberResults = self._parseResult(res);
        reply(cucumberResults).header('Content-Type', 'application/json');
      });
    }
  });
  server.route({
    method: 'GET',
    path: '/run/{absolutePath*}',
    handler: function (request, reply) {
      /// XXX is there a more elegant way we can do this?
      self.options._[2] = request.params.absolutePath;
      self.rerun(function (err, res) {
        var cucumberResults = self._parseResult(res);
        reply(cucumberResults).header('Content-Type', 'application/json');
      });
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
  server.route({
    method: 'GET',
    path: '/runAll',
    handler: function (request, reply) {
      self.options._tags = self.options.tags;
      self.options.tags = '~@ignore';
      self.rerun(function (err, res) {
        self.options.tags = self.options._tags;
        var cucumberResults = self._parseResult(res);
        reply(cucumberResults).header('Content-Type', 'application/json');
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

  log.info(`\n[chimp] Running...`[DEFAULT_COLOR]);

  var self = this;

  function getJsonCucumberResults(result) {
    const startProcessesIndex = 1;
    if (!result || !result[startProcessesIndex]) {
      return [];
    }

    let jsonResult = '[]';
    _.any(['domain', 'e2e', 'generic'], (type) => {
      let _testRunner = _.findWhere(self.testRunnerRunOrder, {name: 'cucumber', type});
      if (_testRunner) {
        jsonResult = result[startProcessesIndex][_testRunner.index];
        return true;
      }
    });
    return JSON.parse(jsonResult);
  }

  async.series(
    [
      self.interrupt.bind(self),
      self._startProcesses.bind(self),
      self.interrupt.bind(self),
    ],
    function (error, result) {
      if (error) {
        log.debug('[chimp] run complete with errors', error);
      } else {
        log.debug('[chimp] run complete');
      }

      if (self.options.simianAccessToken &&
        self.options.simianResultBranch !== false
      ) {
        const jsonCucumberResult = getJsonCucumberResults(result);
        const simianReporter = new exports.SimianReporter(self.options);
        simianReporter.report(jsonCucumberResult, () => {
          callback(error, result);
        });
      } else {
        callback(error, result);
      }
    }
  );

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
    return process.interrupt.bind(process);
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
    return process.start.bind(process);
  });

  // pushing at least one processes guarantees the series below runs
  processes.push(function (callback) {
    log.debug('[chimp] Finished running async processes');
    callback();
  });

  async.series(processes, function (err, res) {
    if (err) {
      self.isInterrupting = false;
      log.debug('[chimp] Finished running async processes with errors');
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
  const self = this;

  const addTestRunnerToRunOrder = function (name, type) {
    self.testRunnerRunOrder.push({name, type, index: processes.length - 1});
  };

  const userHasNotProvidedSeleniumHost = function() {
    return booleanHelper.isFalsey(self.options.host);
  };

  const userHasProvidedBrowser = function() {
    return booleanHelper.isTruthy(self.options.browser);
  };

  if (!this.options.domainOnly) {
    if (this.options.browser === 'phantomjs') {
      process.env['chimp.host'] = this.options.host = 'localhost';
      var phantom = new exports.Phantom(this.options);
      processes.push(phantom);
    }

    else if (userHasProvidedBrowser() && userHasNotProvidedSeleniumHost()) {
      process.env['chimp.host'] = this.options.host = 'localhost';
      var selenium = new exports.Selenium(this.options);
      processes.push(selenium);
    }

    else if (userHasNotProvidedSeleniumHost()) {
      // rewrite the browser to be chrome since "chromedriver" is not a valid browser
      process.env['chimp.browser'] = this.options.browser = 'chrome';
      process.env['chimp.host'] = this.options.host = 'localhost';
      var chromedriver = new exports.Chromedriver(this.options);
      processes.push(chromedriver);
    }
  }

  if (booleanHelper.isTruthy(this.options.mocha)) {
    var mocha = new exports.Mocha(this.options);
    processes.push(mocha);
  } else if (booleanHelper.isTruthy(this.options.jasmine)) {
    const jasmine = new exports.Jasmine(this.options);
    processes.push(jasmine);
  } else {
    if (booleanHelper.isTruthy(this.options.e2eSteps) || booleanHelper.isTruthy(this.options.domainSteps)) {
      // domain scenarios
      if (booleanHelper.isTruthy(this.options.domainSteps)) {
        const options = JSON.parse(JSON.stringify(this.options));
        if (options.r) {
          options.r = _.isArray(options.r) ? options.r : [options.r];
        } else {
          options.r = [];
        }
        const message = '\n[chimp] domain scenarios...';
        options.r.push(options.domainSteps);

        if (booleanHelper.isTruthy(options.fullDomain)) {
          delete options.tags;
        }

        if (!this.options.domainOnly) {
          processes.push(new exports.Consoler(message[DEFAULT_COLOR]));
        }
        processes.push(new exports.Cucumber(options));
        addTestRunnerToRunOrder('cucumber', 'domain');
        processes.push(new exports.Consoler(''));
      }
      if (booleanHelper.isTruthy(this.options.e2eSteps)) {
        // e2e scenarios
        const options = JSON.parse(JSON.stringify(this.options));
        if (options.r) {
          options.r = _.isArray(options.r) ? options.r : [options.r];
        } else {
          options.r = [];
        }

        options.tags = options.tags.split(',');
        options.tags.push(options.e2eTags);
        options.tags = options.tags.join();

        const message = `\n[chimp] ${options.e2eTags} scenarios ...`;
        options.r.push(options.e2eSteps);
        processes.push(new exports.Consoler(message[DEFAULT_COLOR]));
        processes.push(new exports.Cucumber(options));
        addTestRunnerToRunOrder('cucumber', 'e2e');
        processes.push(new exports.Consoler(''));
      }
    }


    else {
      const cucumber = new exports.Cucumber(this.options);
      processes.push(cucumber);
      addTestRunnerToRunOrder('cucumber', 'generic');
    }

  }

  return processes;

};

/**
 * Uses process.kill wen interrupted by Meteor so that Selenium shuts down correctly for node 0.10.x
 *
 * @api private
 */
Chimp.prototype._handleMeteorInterrupt = function () {
  if (process.env.MIRROR_PORT) {
    process.on('SIGINT', function () {
      log.debug('[chimp] SIGINT detected, killing process');
      process.kill();
    });
  }
};

module.exports = Chimp;
