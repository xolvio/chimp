const booleanHelper = require('./boolean-helper');

const screenshotHelper = {
    shouldTakeScreenshot: (status) => {
        return booleanHelper.isTruthy(process.env['chimp.captureAllStepScreenshots']) ||
            (
                status !== 'passed' &&
                booleanHelper.isTruthy(process.env['chimp.screenshotsOnError'])
            );
    },

    saveScreenshotsToDisk: (fileName, projectDir) => {
        if (global.browser.instances) {
            global.browser.instances.forEach(function (instance, index) {
                instance.captureSync(fileName + '_browser_' + index, projectDir);
            });
        } else {
            global.browser.captureSync(fileName, projectDir);
        }
    }
};

module.exports = screenshotHelper;
