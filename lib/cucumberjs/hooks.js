module.exports = function () {
  var passed = true;

  /**
   * Cleanup after each feature
   *
   * @param {Function} event
   * @param {Function} callback
   */
  this.After(function(event, callback) {
    global.browser
      .end()
      .then(callback);
  });

  /**
   * Store browser test status so we can notify SauceLabs
   *
   * @param {Function} event
   * @param {Function} callback
   */
  this.StepResult(function(event, callback) {
    var stepResult = event.getPayloadItem('stepResult');
    passed = stepResult.isSuccessful() && passed;
    callback();
  });

  /**
   * After features have run we close the browser and optionally notify
   * SauceLabs
   *
   * @param {Function} event
   * @param {Function} callback
   */
  this.registerHandler('AfterFeatures', function(event, callback) {
    if (process.env['cuker.host'].toString().match(/saucelabs/)) {
      global.browser
        .sauceJobStatus({
          passed: passed,
          public: true
        })
        .end()
        .then(callback);
    } else {
      global.browser
        .end()
        .then(callback);
    }
  });
};
