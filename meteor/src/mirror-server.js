/*jshint -W030, -W020 */

DEBUG = !!process.env.VELOCITY_DEBUG;

(function () {

  'use strict';

  var path     = Npm.require('path'),
      fs       = Npm.require('fs-extra'),
      freeport = Npm.require('freeport');

  // this library extends the string prototype
  Npm.require('colors');

  var FRAMEWORK_NAME = 'cucumber';
  var WATCH_TAG = '@dev,@watch,@focus';
  var ENV_WHITELIST = [
    'CAPTURE_ALL_STEP_SCREENSHOTS','CHAI','CHIMP_ASYNC',
    'CHIMP_DEBUG','CHIMP_OFFLINE','CHIMP_OPTIONS',
    'CHIMP_NODE_OPTIONS','CUCUMBER','CUCUMBER_COFFEE_SNIPPETS',
    'CUCUMBER_FORMAT','CUCUMBER_JSON_OUTPUT','CUCUMBER_NODES',
    'CUCUMBER_SCREENSHOTS_DIR','CUCUMBER_SERVER_PORT','CUCUMBER_TAGS',
    'CUCUMBER_TAIL','DEBUG','DEBUG_BRK_CUCUMBER','DEBUG_CUCUMBER',
    'FRAMEWORK','HANDSHAKE','HOST',
    'HTTP_FORWARDED_COUNT','HUB_HOST','HUB_PLATFORM',
    'HUB_PORT','HUB_USER','HUB_VERSION',
    'INSTALL_DEPENDENCIES','IS_MIRROR','METEOR_PRINT_ON_LISTEN',
    'MIRROR_PORT','MOBILE_DDP_URL','NODE_ENV',
    'PARENT_URL','PORT','PWD',
    'ROOT_URL','SAVE_SCREENSHOTS','SCREENSHOTS_ON_ERROR',
    'SELENIUM_BROWSER','TMPDIR','VELOCITY',
    'VELOCITY_CI','VELOCITY_DEBUG','VELOCITY_MAIN_APP_PATH',
    'WD_TIMEOUT_ASYNC_SCRIPT','PATH'
  ];
  var BINARY = process.env.CHIMP_PATH || Npm.require('chimp').bin;
  if (
    process.env.NODE_ENV !== 'development' || !process.env.IS_MIRROR ||
    process.env[FRAMEWORK_NAME.toUpperCase()] === '0' ||
    process.env.VELOCITY === '0' ||
    process.env.FRAMEWORK.indexOf(FRAMEWORK_NAME) !== 0
  ) {
    return;
  }

  DEBUG && console.log('[xolvio:cucumber] Mirror server is initializing');

  var _velocityConnection,
      _velocityTestFiles,
      _chimpProc,
      _chimpServerPort,
      _runningParallelTest;

  Velocity.startup(_startChimp);



  Meteor.methods({
    handshake: function () {
      this.unblock();
      DEBUG && console.log('[xolvio:cucumber] Received handshake from Chimp.');
      _init();
    },
    runAll: function () {
      this.unblock();
      DEBUG && console.log('[xolvio:cucumber] Running all specs.');
      _runSingleExecutionMode(true);
    }
  });

  function _findAndRun () {
    DEBUG && console.log('[xolvio:cucumber] Find and run triggered', arguments);

    var findAndRun = function () {
      var feature = _velocityConnection.call('velocity/returnTODOTestAndMarkItAsDOING', {framework: FRAMEWORK_NAME});
      if (feature) {
        _runningParallelTest = true;
        _run(feature, findAndRun);
      }

    };

    if (!!process.env.CUCUMBER_NODES) {
      DEBUG && console.log('[xolvio:cucumber] Running in split-features mode');
      !_runningParallelTest && findAndRun();
    } else {
      DEBUG && console.log('[xolvio:cucumber] Running in batch-features mode.');
      _run();
    }

  }

  function _init () {

    DEBUG && console.log('[xolvio:cucumber] Connecting to hub');

    _velocityConnection = DDP.connect(process.env.PARENT_URL);
    _velocityConnection.subscribe('VelocityTestFiles');

    _velocityTestFiles = new Mongo.Collection('velocityTestFiles', {
      connection: _velocityConnection
    });
    var cursor = _velocityTestFiles.find({targetFramework: FRAMEWORK_NAME});

    _velocityConnection.onReconnect = function () {
      DEBUG && console.log('[xolvio:cucumber] Connected to hub.');
      var rerun = Meteor.bindEnvironment(_findAndRun);
      if (process.env.VELOCITY_CI) {
        rerun = _.once(rerun);
      }
      rerun = _.debounce(rerun, 600);
      cursor.observe({
        added: rerun,
        removed: rerun,
        changed: rerun
      });

      process.on('SIGUSR2', Meteor.bindEnvironment(function () {
        DEBUG && console.log('[xolvio:cucumber] SIGUSR2 signal seen');
        rerun.apply(this, arguments);
      }));
      process.on('message', Meteor.bindEnvironment(function (message) {
        DEBUG && console.log('[xolvio:cucumber] Process message seen', message);
        if (message.refresh && message.refresh === 'client') {
          rerun();
        }
      }));

    };
  }

  function _run (feature, cb) {
    if (feature) {
      _runParallelExecutionMode(feature, cb);
    } else {
      _runSingleExecutionMode();
    }
  }

  function _runSingleExecutionMode (runAll) {
    console.log('[xolvio:cucumber] Cucumber is running'.yellow);
    _velocityConnection.call('velocity/reports/reset', {framework: FRAMEWORK_NAME});

    try {
      HTTP.get('http://localhost:' + _getServerPort() + '/interrupt');


      var endPoint = runAll ? '/runAll' : '/run';

      var response = HTTP.get('http://localhost:' + _getServerPort() + endPoint);

      var results = response.data;

      if (!results) {
        console.error('[xolvio:cucumber] Bad response from Chimp server.'.red);
        console.error(response);
        _finishWithError();
        return;
      }

      DEBUG && console.log('[xolvio:cucumber] Results from Chimp:');
      DEBUG && console.log(results);

      if (results.message) {


        var split = results.message.split('\n');

        _velocityConnection.call('velocity/reports/submit', {

          name: results.name,
          framework: FRAMEWORK_NAME,
          result: 'failed',
          failureMessage: split[0],
          failureType: results.message,
          failureStackTrace: results.stack || split[1] || ''
        });

      }

      if (results.length === 0) {
        console.log('[xolvio:cucumber] No features found. Be sure to annotate scenarios'.yellow,
          'you want to run in watch mode with the'.yellow, WATCH_TAG.cyan, 'tag'.yellow);
        _velocityConnection.call('velocity/reports/submit', {
          name: WATCH_TAG + ' not detected',
          framework: FRAMEWORK_NAME,
          ancestors: ['No specs were run'],
          result: 'passed'
        });
      }
      _processFeatures(results);
    } catch (e) {
      console.error('[xolvio:cucumber] Bad response from Chimp server.'.red, e);
      _finishWithError();
      return;
    }
    _velocityConnection.call('velocity/reports/completed', {framework: FRAMEWORK_NAME});
  }

  function _runParallelExecutionMode (feature, cb) {
    var _error = false;

    console.log('[xolvio:cucumber] Mirror with pid', process.pid, 'is working on', feature.absolutePath, " port ", _getServerPort());

    try {
      var response = HTTP.get('http://localhost:' + _getServerPort() + '/run/' + feature.absolutePath);
      var results = JSON.parse(response.content);
      _processFeatures(results);
    }
    catch (e) {
      console.error('[xolvio:cucumber] Bad response from Chimp server.'.red, 'port: '.red, _getServerPort());
      _error = true;
    }

    if (_error) {
      if (feature.brokenPreviously) {
        _finishWithError();
      } else {
        _velocityConnection.call('velocity/featureTestFailed', {featureId: feature._id});
      }
    }
    else {
      _velocityConnection.call('velocity/featureTestDone', {featureId: feature._id});
    }

    _runningParallelTest = false;
    cb && cb();
  }

  function _finishWithError (report) {
    // attempt to kill any current runs and tell velocity we failed

    try {
      HTTP.get('http://localhost:' + _getServerPort() + '/interrupt');
    } catch (e) {
    }

    report = report || {
        name: 'An error occurred. Check the logs for more information.',
        framework: FRAMEWORK_NAME,
        result: 'failed'
      };
    _velocityConnection.call('velocity/reports/submit', report);
    _velocityConnection.call('velocity/reports/completed', {framework: FRAMEWORK_NAME});
  }

  function _startChimp () {

    var cwd = path.resolve(process.env.VELOCITY_MAIN_APP_PATH, 'tests', FRAMEWORK_NAME);

    if (!fs.existsSync(cwd)) {
      console.log('[xolvio:cucumber]'.yellow, cwd.yellow, 'does not exist. You need to '.yellow +
        'create this directory and add some features to run Cucumber.'.yellow);
      return;
    }

    var startChimpOnPort = function (err, port) {
      _chimpServerPort = port;

      DEBUG && console.log('[xolvio:cucumber] Starting Chimp');
      _chimpProc = new sanjo.LongRunningChildProcess('Chimp_' + _getServerPort());
      if (_chimpProc.isRunning()) {
        DEBUG && console.log('[xolvio:cucumber] Chimp is already running in server mode. Initting');
        _init();
        return;
      }

      var args = _getArgs();

      fs.chmodSync(BINARY, parseInt('555', 8));
      var nodePath = process.execPath;
      var nodeDir = path.dirname(nodePath);
      var env = _.pick(_.clone(process.env), ENV_WHITELIST);
      // Expose the Meteor node binary path for the script that is run
      env.PATH = nodeDir + ':' + env.PATH;
      var spawnOptions = {
        cwd: cwd,
        stdio: 'inherit',
        env: env
      };

      DEBUG && console.log('[xolvio:cucumber] Starting Chimp with', BINARY, args, spawnOptions);

      _chimpProc.spawn({
        command: nodePath,
        args: args,
        options: spawnOptions
      });

      DEBUG && console.log('[xolvio:cucumber] Chimp process forked with pid', _chimpProc.getPid());

    };

    if (!!process.env.CUCUMBER_NODES) {
      freeport(Meteor.bindEnvironment(startChimpOnPort))
    } else {
      var serverPort = process.env.CUCUMBER_SERVER_PORT ? process.env.CUCUMBER_SERVER_PORT : 8866;
      startChimpOnPort(null, serverPort);
    }

  }

  function _getServerPort () {
    return _chimpServerPort;
  }

  function _getScreenshotsDir () {
    var _screenshotsDir = process.env.CUCUMBER_SCREENSHOTS_DIR ||
      path.resolve(process.env.VELOCITY_MAIN_APP_PATH, 'tests', FRAMEWORK_NAME, '.screenshots');
    DEBUG && console.log('[xolvio:cucumber] Screenshots dir is', _screenshotsDir);
    return path.resolve(_screenshotsDir);
  }

  function _getArgs () {

    var args = [];

    if (process.env.CHIMP_NODE_OPTIONS) {
      args.push(process.env.CHIMP_NODE_OPTIONS);
    } else if (process.env.CHIMP_DEBUG) {
      args.push('--debug-brk');
    }

    args.push(BINARY);

    // Individual features files must be the first arguments for CHIMP
    if (process.env.CUCUMBER_FEATURES) {
      args.push(process.env.CUCUMBER_FEATURES);
    }

    args.push('--server');
    args.push('--serverPort=' + _getServerPort());

    args.push('-r');
    args.push(path.join(process.env.VELOCITY_MAIN_APP_PATH, 'tests', 'cucumber', 'features'));
    args.push('--snippets');
    args.push('--ddp=' + process.env.ROOT_URL);
    args.push('--log=error');


    // TODO only if local / xolvio:reporter is detected
    //args.push('--simianResultEndPoint=' + process.env.PARENT_URL.substring('http://'.length) + 'xolvio/reporter/results');
    //args.push('--simianAccessToken=' + 'local');

    if (DEBUG || process.env.DEBUG) {
      args.push('--debug');
    }

    if (process.env.CHAI) {
      args.push('--chai');
    }

    if (process.env.CHIMP_ASYNC) {
      args.push('--sync=false');
    }

    if (process.env.CHROME_BIN) {
      args.push('--chromeBin=' + process.env.CHROME_BIN);
    }

    if (process.env.CHROME_ARGS) {
      args.push('--chromeArgs=' + process.env.CHROME_ARGS);
    }

    if (process.env.CHIMP_OPTIONS) {
      var chimpOptions = process.env.CHIMP_OPTIONS.split(' ');
      while (chimpOptions.length != 0) {
        args.push(chimpOptions.pop());
      }
      return args;
    }

    if (process.env.SCREENSHOTS_ON_ERROR || process.env.VELOCITY_CI) {
      args.push('--screenshotsOnError=true');
    }

    if (process.env.SAVE_SCREENSHOTS || process.env.VELOCITY_CI) {
      args.push('--saveScreenshots=true');
      args.push('--screenshotsPath=' + _getScreenshotsDir());
    }

    if (process.env.CAPTURE_ALL_STEP_SCREENSHOTS) {
      args.push('--captureAllStepScreenshots=true');
    }

    if (process.env.CUCUMBER_COFFEE_SNIPPETS) {
      args.push('--coffee');
    }

    if (process.env.CUCUMBER_TAGS) {
      args.push('--tags=' + process.env.CUCUMBER_TAGS);
    } else if (!process.env.VELOCITY_CI) {
      args.push('--tags=' + WATCH_TAG);
    } else {
      args.push('--tags=~@ignore');
    }

    if (process.env.CUCUMBER_FORMAT) {
      args.push('--format=' + process.env.CUCUMBER_FORMAT);
    }

    if (process.env.SIMIAN_ACCESS_TOKEN) {
      args.push('--simianAccessToken=' + process.env.SIMIAN_ACCESS_TOKEN);
    }

    if (process.env.CUCUMBER_JSON_OUTPUT) {
      args.push('--jsonOutput=' + process.env.CUCUMBER_JSON_OUTPUT);
    }

    if (process.env.WD_TIMEOUT_ASYNC_SCRIPT) {
      args.push('--timeoutsAsyncScript=' + process.env.WD_TIMEOUT_ASYNC_SCRIPT);
    }

    if (process.env.SELENIUM_BROWSER) {
      args.push('--browser=' + process.env.SELENIUM_BROWSER);
    }

    if (process.env.HUB_HOST) {
      args.push('--host=' + process.env.HUB_HOST);
    }

    if (process.env.HUB_PORT) {
      args.push('--port=' + process.env.HUB_PORT);
    }

    if (process.env.HUB_USER) {
      args.push('--user=' + process.env.HUB_USER);
    }

    if (process.env.HUB_KEY) {
      args.push('--key=' + process.env.HUB_KEY);
    }

    if (process.env.HUB_PLATFORM) {
      args.push('--platform=' + process.env.HUB_PLATFORM);
    }

    if (process.env.HUB_VERSION) {
      args.push('--version=' + process.env.HUB_VERSION);
    }

    if (process.env.CHIMP_OFFLINE) {
      args.push('--offline');
    }

    if (process.env.DEBUG_CUCUMBER) {
      args.push('--debugCucumber=' + process.env.DEBUG_CUCUMBER);
    }

    if (process.env.DEBUG_BRK_CUCUMBER) {
      args.push('--debugBrkCucumber=' + process.env.DEBUG_BRK_CUCUMBER);
    }

    return args;

  }

  function _processFeatures (features) {
    _.each(features, function (feature) {
      _processFeature(feature);
    });
  }

  function _processFeature (feature) {
    _.each(feature.elements, function (element) {
      _processFeatureElements(element, feature);
    });
  }

  function _processFeatureElements (element, feature) {
    _.each(element.steps, function (step) {
      _processStep(element, step, feature);
    });
  }

  function _processStep (element, step, feature) {

    if (element.type === 'background') {
      return;
    }

    var report = {
      id: element.id + step.keyword + step.name,
      framework: FRAMEWORK_NAME,
      name: step.keyword + step.name,
      result: step.result.status,
      ancestors: [element.name, feature.name]
    };
    if (step.result.duration) {
      report.duration = Math.round(step.result.duration / 1000000);
    }
    if (step.result.error_message) {

      if (step.result.error_message.name) {
        report.failureType = step.result.error_message.name;
        report.failureStackTrace = _conditionError(step.result.error_message.message);
      } else {
        report.failureStackTrace = _conditionError(step.result.error_message);
      }
    }

    if (step.result.status === 'undefined') {
      report.result = 'failed';
      report.failureStackTrace = 'This step has not been defined';
    }

    if (step.result.status === 'skipped') {
      report.result = 'failed';
      report.failureStackTrace = 'This step was skipped';
    }

    if (step.result.status === 'pending') {
      report.result = 'failed';
      report.failureStackTrace = 'This step is pending';
    }

    // skip before/after if they have no errors
    if (!report.failureStackTrace && (step.keyword.trim() === 'Before' || step.keyword.trim() === 'After')) {
      return;
    }

    _velocityConnection.call('velocity/reports/submit', report);

  }

  function _conditionError (errorMessage) {

    if (DEBUG) {
      console.error(errorMessage.red);
      return errorMessage;
    }

    var msg        = '',
        insertDots = false,
        DOTS       = '  ...\n';

    try {

      if (errorMessage.indexOf('Timed out waiting for asyncrhonous') !== -1) {
        return errorMessage.substring(errorMessage.lastIndexOf('->') + 3, errorMessage.length).trim()
          + ' timed out';
      }

      _.each(errorMessage.split('\n'), function (line, index) {
        line = line.trim();
        if (index === 0) {
          msg += line;
          return;
        }
        if (line.indexOf('/tests/cucumber/') !== -1) {
          if (insertDots) {
            msg += DOTS;
            insertDots = false;
          }
          msg += ((index !== 0 ? '  ' : '') +
          line.replace(process.env.VELOCITY_MAIN_APP_PATH, '') + '\n');
        } else {
          insertDots = true;
        }
      });
      if (insertDots) {
        msg += DOTS;
      }

      // TODO deal with this error for users
      // Cannot call method 'convertScenarioOutlinesToScenarios' of undefined

      msg = msg.substring(0, msg.length);
      //console.log(msg.magenta);
    } catch (e) {
      msg = errorMessage;
      console.error(errorMessage);
    }

    return msg;
  }

})();
