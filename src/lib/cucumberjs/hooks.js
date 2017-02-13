const log = require('../log');
const exit = require('exit');
const _ = require('underscore');
const booleanHelper = require('../boolean-helper');

module.exports = function hooks() {
  const screenshots = {};

  this.setDefaultTimeout(60 * 1000);

  this.registerHandler('BeforeFeatures', () => {
    log.debug('[chimp][hooks] Starting BeforeFeatures');
    global.chimpHelper.setupBrowserAndDDP();
    global.chimpHelper.createGlobalAliases();
    log.debug('[chimp][hooks] Finished BeforeFeatures');
    // noinspection JSUnresolvedVariable
    if (global.UserDefinedBeforeFeatures) {
      log.debug('[chimp][hooks] User-defined BeforeFeatures found, calling');
      // noinspection JSUnresolvedFunction
      global.UserDefinedBeforeFeatures(); // eslint-disable-line new-cap
    } else {
      log.debug('[chimp][hooks] User-defined BeforeFeatures not found, finishing up');
    }
  });


  function shouldTakeScreenshot(stepResult) {
    return booleanHelper.isTruthy(process.env['chimp.captureAllStepScreenshots']) ||
      (
        stepResult.getStatus() !== 'passed' &&
        booleanHelper.isTruthy(process.env['chimp.screenshotsOnError'])
      );
  }

  /**
   * Capture screenshots either for erroneous / all steps
   */
  let lastStep;
  this.StepResult((stepResult) => { // eslint-disable-line new-cap
    lastStep = stepResult.getStep();
    if (shouldTakeScreenshot(stepResult)) {
      log.debug('[chimp][hooks] capturing screenshot');
      if (booleanHelper.isTruthy(process.env['chimp.saveScreenshotsToReport'])) {
        const screenshotId = lastStep.getUri() + ':' + lastStep.getLine();
        // noinspection JSUnresolvedFunction
        screenshots[screenshotId] = {
          keyword: lastStep.getKeyword(),
          name: lastStep.getName(),
          uri: lastStep.getUri(),
          line: lastStep.getLine(),
          png: global.browser.screenshot().value,
        };
      }
      if (booleanHelper.isTruthy(process.env['chimp.saveScreenshotsToDisk'])) {
        const affix = stepResult.getStatus() !== 'passed' ? ' (failed)' : '';
        // noinspection JSUnresolvedFunction
        var _fileName = lastStep.getKeyword() + ' ' + lastStep.getName() + affix;
        if (global.browser.instances) {
          global.browser.instances.forEach(function (instance, index) {
            instance.captureSync(_fileName + '_browser_' + index);
          });
        } else {
          global.browser.captureSync(_fileName);
        }
      }
    }
  });

  /**
   * Stores captures screenshots in the report
   */
  this.After((scenario) => { // eslint-disable-line new-cap
    _.each(screenshots, (element) => {
      const decodedImage = new Buffer(element.png, 'base64');
      scenario.attach(decodedImage, 'image/png');
    });
  });

  /**
   * After features have run we close the browser and optionally notify
   * SauceLabs
   */
  this.registerHandler('AfterFeatures', () => {
    log.debug('[chimp][hooks] Starting AfterFeatures');

    if (process.env['chimp.browser'] !== 'phantomjs') {
      log.debug('[chimp][hooks] Ending browser session');

      global.wrapAsync(global.sessionManager.killCurrentSession, global.sessionManager)();
      log.debug('[chimp][hooks] Ended browser sessions');
    }

    log.debug('[chimp][hooks] Finished AfterFeatures');
  });

  process.on('unhandledRejection', (reason, promise) => {
    log.error('[chimp] Detected an unhandledRejection:'.red);

    try {
      if (reason.type === 'CommandError' && reason.message === 'Promise never resolved with an truthy value') {
        reason.type += 'WebdriverIO CommandError (Promise never resolved with an truthy value)';
        reason.message = 'This usually happens when WebdriverIO assertions fail or timeout.';
        let hint = 'HINT: Check the step AFTER [' + lastStep.getKeyword() + lastStep.getName() + ']';
        let uri = lastStep.getUri();
        uri = uri.substring(process.cwd().length, uri.length);
        hint += ' (' + uri + ': >' + lastStep.getLine() + ')';
        log.error('[chimp][hooks] Reason:'.red);
        log.error('[chimp][hooks]'.red, reason.type.red);
        log.error('[chimp][hooks]'.red, reason.message.red);
        log.error(hint.yellow);
        reason.message += '\n' + hint;
      } else {
        log.error('[chimp][hooks]'.red, reason.stack);
      }
    } catch (e) {
      log.debug('[chimp][hooks] Could not provide error hint');
    }

    log.debug('[chimp][hooks] Promise:', JSON.parse(JSON.stringify(promise)));
    log.debug('[chimp][hooks] Forcibly exiting Cucumber');

    process.send(JSON.stringify(reason));
    // Don't exit until the waitUntil uncaught promise bug is fixed in WebdriverIO
    // exit(2);
  });

  process.on('SIGINT', () => {
    log.debug('[chimp][hooks] Received SIGINT process event, ending browser session');
    global.browser.endAsync().then(() => {
      log.debug('[chimp][hooks] ended browser session');
      exit();
    });
  });
};
