var log = require('../log');
var exit = require('exit');

module.exports = function () {
  var screenshots = {};
  this.registerHandler('BeforeFeatures', function () {
    log.debug('[chimp][hooks] Starting BeforeFeatures');
    worldHelper.setupBrowserAndDDP();
    log.debug('[chimp][hooks] Finished BeforeFeatures');
    if (this.UserDefinedBeforeFeatures) {
      log.debug('[chimp][hooks] User-defined BeforeFeatures found, calling');
      // TODO: Wrap in the same thing as the Cucumber words (see cucumber-wrapper.js)
      global.UserDefinedBeforeFeatures.apply(this);
    } else {
      log.debug('[chimp][hooks] User-defined BeforeFeatures not found, finishing up');
    }
  });

  /**
   * Capture screenshots either for erroneous / all steps
   *
   * @param {Function} event
   */
  var lastStep;
  this.StepResult(function (event) {
    var stepResult = event.getPayloadItem('stepResult');
    lastStep = stepResult.getStep();
    if (process.env['chimp.captureAllStepScreenshots'] !== 'false' ||
      (process.env['chimp.screenshotsOnError'] !== 'false' && !stepResult.isSuccessful())) {
      log.debug('[chimp][hooks] capturing screenshot');
      if (process.env['chimp.attachScreenshotsToReport'] !== 'false') {
        var screenshotId = lastStep.getUri() + ':' + lastStep.getLine();
        screenshots[screenshotId] = {
          keyword: lastStep.getKeyword(),
          name: lastStep.getName(),
          uri: lastStep.getUri(),
          line: lastStep.getLine(),
          png: browser.screenshot().value
        };
      }
      if (process.env['chimp.saveScreenshots'] !== 'false') {
        var affix = !stepResult.isSuccessful() ? ' (failed)' : '';
        browser.captureSync(lastStep.getKeyword() + ' ' + lastStep.getName() + affix);
      }
    }
  });

  /**
   * Stores captures screenshots in the report
   *
   * @param {Function} scenario
   */
  this.After(function (scenario) {
    for (var i in screenshots) {
      var decodedImage = new Buffer(screenshots[i].png, 'base64').toString('binary');
      scenario.attach(decodedImage, 'image/png');
    }
  });

  /**
   * After features have run we close the browser and optionally notify
   * SauceLabs
   *
   * @param {Function} event
   * @param {Function} callback
   */
  this.registerHandler('AfterFeatures', function (event) {
    log.debug('[chimp][hooks] Starting AfterFeatures');

    if (process.env['chimp.browser'] !== 'phantomjs') {
      log.debug('[chimp][hooks] Ending browser session');

      wrapAsync(global.sessionManager.killCurrentSession, global.sessionManager)();
      log.debug('[chimp][hooks] Ended browser sessions');
    }

    log.debug('[chimp][hooks] Finished AfterFeatures');
  });

  process.on('unhandledRejection', function (reason, promise) {
    log.error('[chimp] Detected an unhandledRejection.'.red);

    try {
      if (reason.type === 'CommandError' && reason.message === 'Promise never resolved with an truthy value') {
        reason.type += 'WebdriverIO CommandError (Promise never resolved with an truthy value)';
        reason.message = 'This usually happens when WebdriverIO assertions fail or timeout.';
        var hint = 'HINT: Check the step AFTER [' + lastStep.getKeyword() + lastStep.getName() + ']';
        var uri = lastStep.getUri();
        uri = uri.substring(process.cwd().length, uri.length);
        hint += ' (' + uri + ': >' + lastStep.getLine() + ')';
        log.error('[chimp][hooks] Reason:'.red);
        log.error('[chimp][hooks]'.red, reason.type.red);
        log.error('[chimp][hooks]'.red, reason.message.red);
        log.error(hint.yellow);
        reason.message += '\n' + hint;
      } else {
        log.error('[chimp][hooks] Reason:'.red);
        log.error('[chimp][hooks]'.red, reason.type.red);
        log.error('[chimp][hooks]'.red, reason.message.red);
      }
    } catch (e) {
      log.debug('[chimp][hooks] Could not provide error hint');
    }

    log.debug('[chimp][hooks] Promise:', JSON.parse(JSON.stringify(promise)));
    log.debug('[chimp][hooks] Forcibly exiting Cucumber');

    process.send(JSON.stringify(reason));
    // Don't exit until the waitUntil uncaught promise bug is fixed in WebdriverIO
    //exit(2);
  });

  process.on('SIGINT', function () {
    //TODO TheBrain here is how you end the session?
    log.debug('[chimp][hooks] Received SIGINT process event, ending browser session');
    global.browser.
      endAsync().
      then(function () {
        log.debug('[chimp][hooks] ended browser session');
        exit();
      });
  });

};
