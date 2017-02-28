const _ = require('underscore'),
    os = require('os'),
    log = require('./log'),
    async = require('async'),
    request = require('request'),
    execSync = require('child_process').execSync,
    selenium = require('selenium-standalone'),
    chromedriver = require('chromedriver'),
    booleanHelper = require('./boolean-helper'),
    processHelper = require('./process-helper.js');

function Versions(options) {
    this.options = options;

    this.appDir = '../..';
    this.chromeDriverExec = chromedriver.path;

    this.show = (callback) => {
        console.log('Chimp version: ', this.getChimpVersion());
        console.log('ChromeDriver version: ', this.getChromeDriverVersion());
        console.log('Java version: ', this.getJavaVersion());
        console.log('Selenium version: ', this.getSeleniumVersion());
        console.log('Selenium drivers version: ', this.getSeleniumDriversVersion());
        console.log('OS version: ', this.getOsVersion());
        console.log('Node version: ', this.getNodeVersion());
        this.getCurrentBrowserVersion((browserVersion) => {
            const currentBrowser = this.options.browser || 'chrome';
            console.log('Browser version: ', currentBrowser, browserVersion);
            if (callback) {
                callback();
            }
        });
    };

    this.getChimpVersion = () => {
        const packageJson = require(`${this.appDir}/package.json`);
        return packageJson.version;
    };

    this.getChromeDriverVersion = () => {
        if (booleanHelper.isFalsey(this.options.host)) {
            if (booleanHelper.isTruthy(this.options.browser)) {
                return 'Unknown. Chromedriver not used directly.';
            }
            else {
                return this._execSync(`${this.chromeDriverExec} -v`);
            }
        }
        else {
            return 'Unknown. Selenium host provided.';
        }
    };

    this.getJavaVersion = () => {
        return this._execSync('java -version 2>&1');
    };

    this.getSeleniumVersion = () => {
        if (this.options.seleniumStandaloneOptions) {
            return this.options.seleniumStandaloneOptions.version;
        }
        return "Unknown.";
    };

    this.getSeleniumDriversVersion = () => {
        if (this.options.seleniumStandaloneOptions) {
            let driversVersion = [];
            const drivers = this.options.seleniumStandaloneOptions.drivers;
            _.each(_.keys(drivers), (driverName) => {
                driversVersion.push(`${driverName}: ${drivers[driverName].version}`);
            });
            return driversVersion.toString().replace(/,/g, ', ');
        }
        return "Unknown.";
    };

    this.getOsVersion = () => {
        return `${os.type()} ${os.release()}`;
    };

    this.getNodeVersion = () => {
        return process.version;
    };

    this.getCurrentBrowserVersion = (callback) => {
        if (booleanHelper.isTruthy(this.options.browser)) {
            const seleniumOptions = _.clone(this.options.seleniumStandaloneOptions);
            seleniumOptions.port = 1;

            async.series([
                    (cb) => {
                        selenium.install(
                            seleniumOptions
                            ,  (err, seleniumInstallPaths) => {
                                cb(err, seleniumInstallPaths);
                            });
                    }
                ],
                (err, seleniumInstallPaths) => {
                    const selectedBrowserDriver = seleniumInstallPaths[0][this.options.browser];
                    if (selectedBrowserDriver) {
                        const startBrowserOptions = {
                            path: selectedBrowserDriver.installPath,
                            port: this.options.port
                        };
                        this._startBrowserDriver(startBrowserOptions, () => {
                            this._getBrowserVersion(startBrowserOptions, (err, browserVersion) => {
                                this._stopBrowserDriver((err) => {
                                    if (err) {
                                        log.warn(err);
                                    }
                                    callback(browserVersion);
                                });
                            });
                        });
                    }
                    else {
                        callback(`Driver for selected browser(${this.options.browser}) not found.`);
                    }
                }
            );
        }
        else {
            const startBrowserOptions = {
                path: this.chromeDriverExec,
                port: this.options.port
            };
            this._startBrowserDriver(startBrowserOptions, () => {
                this._getBrowserVersion(startBrowserOptions, (err, browserVersion) => {
                    this._stopBrowserDriver((err) => {
                        if (err) {
                            log.warn(err);
                        }
                        callback(browserVersion);
                    });
                });
            });
        }
    };

    // -------------------------------------------------------------------------------------

    this._startBrowserDriver = (options, callback) => {
        const waitMessage = new RegExp(`${options.port}`);
        this.child = processHelper.start({
            bin: options.path,
            prefix: 'browserdriver',
            args: ['--port=' + options.port],
            waitForMessage: waitMessage,
            errorMessage: /Error/
        }, callback);
    };

    this._getBrowserVersion = (options, callback) => {
        const url = `http://localhost:${options.port}/session`;
        const data = {"desiredCapabilities":{}};

        request.post(
            {
                url,
                json: true,
                body: data,
            },
            (error, response, body) => {
                const data = {};
                if (!error && response.statusCode === 200) {
                    data.sessionId = body.sessionId;
                    data.browserVersion = body.value.version;
                    request.delete(`${url}/${data.sessionId}`,
                        () => {
                            callback(null, data.browserVersion);
                        }
                    );
                } else {
                    error = 'Error connecting to browser driver.';
                    callback(error);
                }
            }
        );
    };

    this._stopBrowserDriver = (callback) => {
        if (this.child) {
            var options = {
                child: this.child,
                prefix: 'browserdriver'
            };

            processHelper.kill(options, (err, res) => {
                this.child = null;
                callback(err, res);
            });

        } else {
            callback(null);
        }
    };

    this._execSync = (commandToRun) => {
        const endLine = new RegExp(`${os.EOL}`, 'g');
        return execSync(commandToRun).toString().trim().replace(endLine, ', ');
    }
}

module.exports = Versions;