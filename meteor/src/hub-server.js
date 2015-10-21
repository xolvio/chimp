/*jshint -W030, -W020 */

DEBUG = !!process.env.VELOCITY_DEBUG;

(function () {

  'use strict';

  var path = Npm.require('path');

  var FRAMEWORK_NAME  = 'cucumber',
      FRAMEWORK_REGEX = '^tests/' + FRAMEWORK_NAME + '/((?!node_modules/).)+\\.(feature|js|coffee|litcoffee|coffee\\.md)$',
      SAMPLE_TESTS    = [{
        contents: Assets.getText(path.join('src', 'sample-tests', 'feature.feature')),
        path: path.join(FRAMEWORK_NAME, 'features', 'sample.feature')
      }, {
        contents: Assets.getText(path.join('src', 'sample-tests', 'steps.js')),
        path: path.join(FRAMEWORK_NAME, 'features', 'step_definitions', 'sample_steps.js')
      }, {
        contents: Assets.getText(path.join('src', 'sample-tests', 'fixture.js')),
        path: path.join(FRAMEWORK_NAME, 'fixtures', 'my_fixture.js')
      }, {
        contents: Assets.getText(path.join('src', 'sample-tests', 'package.json')),
        path: path.join(FRAMEWORK_NAME, 'package.json')
      }];

  if (!!process.env.INSTALL_DEPENDENCIES) {
    _installDependencies();
  }

  if (process.env.NODE_ENV !== 'development' || process.env.IS_MIRROR ||
    process.env[FRAMEWORK_NAME.toUpperCase()] === '0' || process.env.VELOCITY === '0') {
    return;
  }

  DEBUG && console.log('[xolvio:cucumber] Cucumber hub is loading');

  if (Velocity && Velocity.registerTestingFramework) {
    Velocity.registerTestingFramework(FRAMEWORK_NAME, {
      regex: FRAMEWORK_REGEX,
      sampleTestGenerator: function () { return SAMPLE_TESTS; }
    });
  }

  Meteor.methods({
    'cucumber/run': function () {
      this.unblock();
      var mirror = DDP.connect(VelocityMirrors.findOne({framework: 'cucumber'}).host);
      mirror.call('runAll', function () {
        mirror.disconnect();
      });
    }
  });

  Velocity.startup(function () {
    Meteor.call('velocity/mirrors/request', {
      framework: FRAMEWORK_NAME,
      args: ['--raw-logs'],
      testsPath: path.join(FRAMEWORK_NAME, 'fixtures'),
      nodes: process.env.CUCUMBER_NODES ? parseInt(process.env.CUCUMBER_NODES) : 1
    });

    if (process.env.CUCUMBER_TAIL) {
      _tailCucumberLogs();
    }


    var initOnce = _.once(Meteor.bindEnvironment(_init));
    VelocityMirrors.find({framework: FRAMEWORK_NAME, state: 'ready'}).observe({
      added: initOnce,
      changed: initOnce
    });
  });

  function _init () {

    if (!!process.env.CUCUMBER_NODES) {

      var debouncedRun = _.debounce(Meteor.bindEnvironment(_run), 600);
      VelocityTestFiles.find({targetFramework: FRAMEWORK_NAME}).observeChanges({
        added: debouncedRun,
        removed: debouncedRun,
        changed: debouncedRun
      });
      process.on('SIGUSR2', Meteor.bindEnvironment(debouncedRun));
      process.on('message', Meteor.bindEnvironment(function (message) {
        if (message.refresh && message.refresh === 'client') {
          debouncedRun();
        }
      }));

    }
  }

  function _tailCucumberLogs () {

    var cucumberLogFilePath = path.join(process.env.PWD, '.meteor', 'local', 'log', 'cucumber.log')
    var Tail = Npm.require('tail-forever');
    var tail = new Tail(cucumberLogFilePath, {});

    tail.on('line', function (data) {
      console.log('[cucumber.log]', data);
      if (data.indexOf('Exiting cucumber') !== -1) {
        tail.unwatch();
      }
    });

    tail.on('error', function (error) {
      console.error('[cucumber.log]', error);
    });

  }

  function _run (id, changes) {

    if (changes && changes.status) {
      // one of the files has changed status. good time to check if all files are done
      if (VelocityTestFiles.find({targetFramework: FRAMEWORK_NAME, status: 'DONE'}).count ===
        VelocityTestFiles.find({targetFramework: FRAMEWORK_NAME}).count) {
        Meteor.call('velocity/reports/completed', {framework: FRAMEWORK_NAME});
      }
      return;
    }

    Meteor.call('velocity/reports/reset', {framework: FRAMEWORK_NAME});

    // set all file statuses so mirrors can start working on files
    VelocityTestFiles.update(
      {targetFramework: FRAMEWORK_NAME, relativePath: /\.feature$/},
      {$set: {status: 'TODO'}},
      {multi: true}
    );

  }

  function _installDependencies () {
    DEBUG && console.log('[xolvio:cucumber] Attempting to install chimp dependencies');
    if (DEBUG) {
      process.env['chimp.debug'] = true;
    }
    Meteor.wrapAsync(Npm.require('chimp').install)();
  }


})();
