# 0.49.0

* fix for 524 - slowdown overtime (Lukasz Gandecki) 
* Adds the release notes for v0.48.0 (Lukasz Gandecki) 

# 0.48.0

* Limit screenshot filename (lucetius) 
* Improve readability of failWhenNoTestsRun functionality (lucetius) 
* Handle Promises returned by tests (#605) (Mike Cardwell) 
* Fixes ending of process.stdin that caused errors when interrupting watch mode (lucetius) 
* Fix Cucumber Failure output (lucetius) 
* small clean up (Łukasz Gandecki) 
* small clean up (Łukasz Gandecki) 
* Add options and desired capabilities to browser instances (Tomasz Wilczek) 
* Trigger CircleCI build on new environment Ubuntu 14.04 (lucetius) 
* Update Selenium to 3.0.1 / Fix Firefox startup problem (lucetius) 
* Fix closing BrowserStack session on test end (lucetius) 
* Add support for capturing screenshots for Jasmine and Mocha (lucetius) 
* Add support for non-zero exit code for mocha and jasmine when no tests are found. (lucetius) 
* Add support for non-zero exit code when cucumber tests not found. (lucetius) 
* Fix embedded screenshots in JSON output (lucetius) 
* Update displayed github header text in tests (Tomasz Wilczek) 
* Fix duplicate removeListener for stderr and stdout / Update tests for process-helper (lucetius) 
* Handle chromedriver executable not found error (lucetius) 
* Fix command not found in versions check (lucetius) 
* Add --versions switch to output versions of Chimp dependencies (lucetius) 
* Fixed console log for multiple watchTags (lucetius) 
* Add path support in DDP url (lucetius) 
* Fix calling interrupt function when error occurs (lucetius) 
* Adds the release notes for v0.47.2 (Lukasz Gandecki) 
* Fix terminating application (lucetius) 
* Adds babel polyfill instead transform runtime plugin (lucetius) 

# 0.47.2

* Update cucumber to v1.3.0-chimp.2, add cucumber test for global pending (lucetius) 
* Fix fiberize function for throwing errors in tests (lucetius) 
* Fixes 560 pipe chimp stdin to test runner (tiagolr) 
* Adds the release notes for v0.47.1 (Sam Hatoum) 

# 0.47.1

* updating chromedeiver to 2.27.2 (#562) (Gregory Parsons) 
* Improves the release script (Sam Hatoum) 
* Adds history (Sam Hatoum) 

# 0.47.0

* Fixes multiple ddp servers in watch mode (Sam Hatoum) 
* Use new wrapper-instance (Sam Hatoum) 
* Add commandline config example (Sam Hatoum) 
* Feature - Enable Mocha glob pattern (#555) (Evan Francis) 
* Fixes Selenium Hub error handling (#552) (lucetius) 
* Fixes mochaCommandLineOptions CLI parameter (#553) (lucetius) 
* Fixes new test stack configuration (Sam Hatoum) 
* fix Meteor multiple servers .execute() (#556) (Evan Francis) 
* Fixes random CircleCI fails (#559) (Sam Hatoum) 
* Improvement/move to mocha (#551) (Sam Hatoum) 
* Adds the release notes for v0.46.0 (Sam Hatoum) 

# 0.46.0

* Feature multiple meteor servers (#549) (Evan Francis) 
* Create jsonOutput file only when cucumber steps are defined (#548) (lucetius) 
* Fixes received error null when using hub-cloud.browserstack.com hostname (#547) (lucetius) 
* Updates safe-to-update npm dependencies (Sam Hatoum) 
* Fixes weirdo babel error (Sam Hatoum) 
* Fixes weirdo babel error (Sam Hatoum) 
* Update circle.yml (Sam Hatoum) 
* Adds the release notes for v0.45.1 (Sam Hatoum) 

# 0.45.1

* add geckodriver to seleniumstandaloneoptions (#506) (Stephen Davidson) 
* Increase chromedriver version to 2.25. (#518) (Kyle Ian) 
* Adds the release notes for v0.45.0 (Sam Hatoum) 

# 0.45.0

* Updates to latest wdio-sync (Sam Hatoum) 
* mention mocha config breaking change in history.md (#539) (Dheeraj Bhaskar) 

# 0.44.0

* Improvement/offline detection (#535) (Sam Hatoum) 
* Improvement/custom mocha options (#534) (Sam Hatoum) 
  - **Breaking change:** the old mochaXYZ options are not read, put mocha config in mochConfig {} object as in https://github.com/xolvio/chimp/blob/master/src/bin/default.js 
* Improvement/chrome driver mode (#533) (Sam Hatoum) 

# 0.43.0

* version bump (Lukasz Gandecki) 
* Fixes not reusing browser session in watch mode (lucetius) 
* readme (Greg Parsons) 
* adds npm-watch to allow running `npm run watch` to run the npm task &#39;prepublish&#39; on changes to src/lib or src/bin (Greg Parsons) 
* Update phantom-spec.js (Mike Naughton) 
* Use new phantom_ignoreSSLErrors option (Mike Naughton) 
* Add configuration option for ignoring SSL errors (Mike Naughton) 
* made slack community clickable (Dheeraj Bhaskar) 
* added new line for formatting (Dheeraj Bhaskar) 
* added back the new lines (Dheeraj Bhaskar) 
* Make Community links explicit (Dheeraj Bhaskar) 
* Use a valid base64 image/png encoding when attaching screenshots to a scenario  (fixes #462) (Logan Koester) 
* Fixes circle config file syntax (Sam Hatoum) 
* Adds the release notes for v0.41.2 (Sam Hatoum) 
* use a released version of xolvio sync-webdriverio instead of a github link (lgandecki) 
* Adds direct chromedriver functionality (lucetius) 

 # 0.42.0

* Refactor timeout variable (lucetius) 
* Proper cucumber close, preventing tests from running, closing browser (lucetius) 
* Meteor error handling - WIP (lucetius) 
* Adds proper error handling when meteor is not running (lucetius) 
* Change default timeout value in server.execute (lucetius) 
* Fix proper timeouts error handling for server.execute (lucetius) 
* Remove initSync for init single browser, change xolvio-sync-webdriverio version to support browser.desiredCapabilities and browser.options (lucetius) 

# 0.41.2

* Removes duplicate circle config (Sam Hatoum) 
* increase chromedriver (Maxim Chouinard) 
* Update ISSUE_TEMPLATE.md (Sam Hatoum) 
* Update ISSUE_TEMPLATE.md (Sam Hatoum) 
* Update ISSUE_TEMPLATE.md (Sam Hatoum) 
* reverted request to a previous version. 2.74.0 doesn&#39;t install on node v4 (lgandecki) 
* Update README.md (Sam Hatoum) 
* Fix for 2 vulnerable dependency paths (Snyk Community) 

# 0.41.1
* Update selenium-standalone to the latest version (Sam Hatoum) 
* Add Xolvio messages to users (Sam Hatoum)

# 0.41.0
* Use phantomjs-prebuilt from the Medium team (Sam Hatoum) 
* Updates Cucumber to 1.3.0-chimp.1 (fixes 432) (Sam Hatoum) 
* Rewrite of the Domain vs E2E runs (Sam Hatoum) 
* Fixes DEBUG parsing (Sam Hatoum) 

# 0.40.7

* Fix automocking of wrappy library (Sam Hatoum) 
* Fix hanging selenium in non-watch mode (Sam Hatoum) 
* Fix  debug logging when running Chimp programmatically (Sam Hatoum) 
* Fix hanging selenium in non-watch mode (Sam Hatoum) 

# 0.40.6

* Stop piping stdin as it messes with Gulp and is not needed (Sam Hatoum) 
* Adds the release notes for v0.40.5 (Sam Hatoum) 

# 0.40.5

* Update fibers - support for Node v6.5.0 (Daniel Bayerlein) 
* Update fiberize util function (lucetius) 
* Add backtrace option value to cucumber exec option (lucetius) 
* Use updated version of cucumber with support for global pending (lucetius) 
* Update ISSUE_TEMPLATE.md (Sam Hatoum) 
* Update ISSUE_TEMPLATE.md (Sam Hatoum) 
* Update ISSUE_TEMPLATE.md (Sam Hatoum) 
* Fix deprecated usage of cucumber hooks (Jez Stephens) 
* Update README.md (Sam Hatoum) 
* Update README.md (Sam Hatoum) 
* Adds the release notes for v0.40.4 (Sam Hatoum) 
* change the selenium version parameter to browserVersion (dankelleher) 

# 0.40.4

* No need to checkout (Sam Hatoum) 

# 0.40.1

* Fixes history file not being commited (Sam Hatoum) 
* Automatically writes the commit history to the HISTORY.md file (Sam Hatoum) 

# 0.40.0

* Update HISTORY.md (Sam Hatoum) 
* Automatically writes the commit history to the HISTORY.md file (Sam Hatoum) 

# 0.39.4

* Updated to 1.2.2 version of xolvio/cucumber (lgandecki) 

# 0.39.3

* Make Cucumber.js a bundledDependency (Sam Hatoum) 

# 0.39.1

* Fixing issue #430 (Duc Tri Le)


# 0.39.0

* Nicer approach to setting the args (Joe Farro) 
* allow seleniumStandaloneOptions.seleniumArgs to be set - fixes #428 (Joe Farro) 
* use the newest current version of node for circle testing (lgandecki) 
* getting rid of the remains of chimp widgets (lgandecki) 
* updated version of cucumberjs (lgandecki) 
* Removes chimp-widgets. Fixes #333 (Sam Hatoum)  
* updating node-fibers version (Greg Parsons) 
* updating circle node version (Greg Parsons) 
* updating packages relying on fs (Greg Parsons) 

# 0.38.0

* Updated to PhantomJS 2
* Updates Mocha to 2.53

# 0.37.1

* Fixes Cucumber.js error conditioning

# 0.37.0

* Adds mochaGrep field
* Extracts the selenium-standalone options
* Allows custom Phantom-bin path
* Lots of bug fixes

# 0.36.0

* Simian fixes

# 0.35.0

* Feature: Support for multibrowser testing

# 0.34.1

* Fix (#351): When the browser.debug() statement is hit I expect
  to continue the test by pressing [ENTER] in the console window.

# 0.34.0

* Only take screenshots on errors in CI environment
  (when CI environment variable is set to a truthy value) (fixes #344).
  This fixes the problem that Chrome focuses when an error happens.
* Use timeoutsImplicitWait default of 0 again (fixes #348, fixes #330).
  Because the implicit wait will always wait the full 3000 seconds when the element
  has not been found initially. It has no concept of a retry interval as assumed.

# 0.33.1

* Fixes jasmine watch mode

# 0.33.0

* Feature: Adds `jasmine.addSpecFilter` API for adding custom spec filters.

# 0.32.1

* Fix: Overwrite options with array values completely
       instead of merging the default array value and the user array value.
* Fix: Multiple watch tags with Jasmine

# 0.32.0

* Feature: Support for Jasmine
  * [Getting started with Jasmine](https://chimp.readme.io/docs/getting-started-jasmine)
  * [Jasmine support](https://chimp.readme.io/v1.0/docs/jasmine-support)
* Upgrade: WebDriver.io 4 is now used.
  * Breaking change: The webdriverio async API no longer supports callbacks, only promises.
* Fix: Take only screenshots of errors to disk by default.
* Change: Set timeoutsImplicitWait to 3 seconds by default

# 0.31.1

* Fixes default option value for deviceName.
  So webdriverio no longer defaults to mobile mode.

# 0.31.0

* Updates Webdriver.io to 3.4.0
* Support for all webdriverio options in config
* __Breaking change__: Removed the feature
  where you could do a custom initialization of webdriver via a chimp.js file.
  Pass the webdriverio options via the config file instead.
* __Breaking change__: Moved webdriverio specific options under the webdriverio config key.
  All options that are documented (here)[http://webdriver.io/guide/getstarted/configuration.html] are supported.
    * Moved options:
      * baseUrl --> webdriverio.baseUrl
      * waitForTimeout -> webdriverio.waitforTimeout
      * webdriverLogLevel -> webdriverio.logLevel
    * Removed options:
      * that can be configured via desiredCapabilities now
        * chromeBin
        * chromeArgs
        * chromeNoSandbox
        * browserstackLocal
        * tunnelIdentifier
      * that can be configured via the webdriverio API
        * [timeoutsAsyncScript](http://webdriver.io/api/protocol/timeoutsAsyncScript.html)
        * [timeoutsImplicitWait](http://webdriver.io/api/protocol/timeoutsImplicitWait.html)
* Use ia32 architecture for Internet Explorer
* Fix: Output cucumber hook errors to the console
* Fix: Saving screenshots
* Fix: Use https:// for downloading selenium drivers (fixes #291)

# 0.30.1

* Better Appium support (195ad5a)
* Fixes Simian reporting error when no specs were executed

# 0.30.0

* Fixes ES2015 support when using NPM 3 (Node.js 5)
* Fixes ES2015 support when using Windows
* Support for passing arguments without an equal sign

# 0.29.0

* ES2015 support for Mocha tests

# 0.28.2

* Fixes watchTags and DDP errors in Mocha

# 0.28.1

* Adds `--domainSteps` for critical steps mode

# 0.28.0

* Adds custom config file option
* Fixes missing global pending callback 

# 0.27.0

* Support for reporting multiple results for the same build to Simian.
* Fixes getting JSON result from Cucumber (regression from 0.26.0).

# 0.26.0

* Updates Cucumber.js to 0.9.4 from 0.5.3
* ES2015 support for Cucumber step definitions
* Fixes and updates selenium-standalone and IE driver
* Fixes synchronous execution of custom WebDriver.io commands
* Fixes `this` context in custom WebDriver.io commands and waitUntil conditions
  to be the synchronous WebDriver.io remote (the same as global.browser)

# 0.25.1

* Fixes BrowserStack local testing

# 0.25.0

* Addition of SessionFactory and BrowserStack and SauceLabs session managers (Derek Hamilton)
* Changed chimp helper to configure the widget driver after loading the browser (Lewis Wright)
* Adds the Tunnel Identifier (Sam Hatoum)

# 0.24.1

* Improves `singleSnippetPerFile` mode tet

# 0.24.0

* Removes automatic npm install
* Adds `singleSnippetPerFile` mode

# 0.23.0

* Sets an implicit wait of 3 seconds
* Adds support for critical runs

# 0.22.3

* Option `--simianRepositoryId` for passing repositoryId to Simian (#210)

# 0.22.2

* Fixes multiple -r / --require options
* Fixes a spec dependency problem
* Increases Mocha slow timer to 10s for e2e tests
* Removes xolvio:cucumber (RIP)
* Updates npm request
* Fixes the loading order from --path

# 0.22.1

* Fixes `client.debug()` not continuing when pressing ENTER

# 0.22.0

* Adds Meteor hot-code-push listener to the watcher so Chimp reruns after Meteor reloads 
* Deprecates the xolvio:cucumber package in favor of Chimp
* Improves caching on circle

# 0.21.0

* Adds server.execute() for executing code on the Meteor server
* Upgrades selenium, chrome-driver and IEDriver (#185)
* Fixes issue with path ((#143)
* Fixes server.call method for the case when the first param is a falsy value
* Report the branch to the Simian result API

# 0.20.2

* Adds color to Mocha console report
* Improves failure chimp logs

# 0.20.1

* Fixes missing self reference issue

# 0.20.0

* Adds support for Mocha e2e testing (instead of Cucumber)
* Applies environment variable white listing only to the debug output

# 0.19.3 - 0.19.5

* Renames widgets to chimpWidgets
* Fixes memory hogging through screenshot capturing

# 0.19.1 - 0.19.2
 
* Fixes version issues between xolvio:cucumber and chimp

# 0.19.0

* Start tests in Velocity.startup (Jonas Aschenbrenner) 
* Wait for tests before starting tests in CI (Jonas Aschenbrenner) 
* Start mirror in Velocity.startup (Jonas Aschenbrenner) 
* Generates history from git commits (Sam Hatoum) 
* Merges Chimp and meteor-cucumber codebases (Sam Hatoum) 
* Adds user-defined world support (Sam Hatoum) 
* Extracts setup of browser, ddp, assertion libraries and global logic to a helper (Sam Hatoum) 
* Fixes memory hogging screeshot logic (Sam Hatoum) 
* Extracts the DDP logic from the world and adds tests (Sam Hatoum) 
* Pass through the specified host and consume in the session manager (Dane Harnett) 

# 0.15.x - 0.18.x
* Merged the Chimp & meteor-cucumber code and bumped meteor-cucumber to match Chimp's latest version

# 0.14.11

* Updates Chimp to 0.18.0
* Adds multiple feature running

# 0.14.10

* Updates Velocity core

# 0.14.9

* Adds a CI "once" mode

# 0.14.8

* Updating to chimp 0.17.1

# 0.14.7

* Updates sample specs to synchronous mode
* Updating to chimp 0.17.0
  * Adds CHROME_ARGS option

# 0.14.2

* Updating to chimp 0.16.0
  * Adds CHROME_BIN option

# 0.14.1

* Updating to chimp 0.15.4
* Reinstates chimp-widgets

# 0.14.0

* Meteor 1.2 compatible
* Updating to chimp 0.15.3
* Synchronous WebdriverIO (breaking change)
* Jasmine assertions by default instead of chai (breaking change)
* Global `pending()` and `fail()` methods available in steps
* Screenshots can be attached in the JSON report
* Screenshots name match the step that produced them
* Screenshots can be captured for all steps (not just failing ones)

# 0.13.8

* Updating to chimp 0.12.10

# 0.13.7

* Updating to chimp 0.12.9

# 0.13.4-6
* Broken connection duff releases

# 0.13.3

* Improved logging in Chimp

# 0.13.2

* Using env-set as a temporary workaround to issue in sanjo:long-running-child-process

# 0.13.1

* Uses Chimp update which contains logging improvements and bug fix for runAll button

# 0.13.0

* Added CHIMP_DEBUG to allow debugging of the Chimp and Cucumber child processes
* Added CHIMP_NODE_OPTIONS for finer control over the node process that starts chimp
* Added DEBUG_CUCUMBER and DEBUG_BRK_CUCUMBER that allows you to debug steps
* Pending tests are now considered a failure
* Improved logging

# 0.12.3

* Updated to chimp v0.12.2
* Updated HTML-reporter
* Added offline switch to Chimp
* Added Simian reporting delegate to Chimp
* Fixed sample tests to use new WebdriverIO promises
* Cucumber now only resets its own reports

# 0.12.2

* Exposing the SIMIAN_ACCESS_TOKEN flag for chimp

# 0.12.1

* Upgraded to Chimp 0.12.0 which gives the following:
  * Result reporting to Simian.io
  * Cleans up logs
  * Uses NPM of the main running process

# 0.12.0

* You can now run all specs from the HTML reporter with one button to get feedback over the whole suite
* Increased de-bounce window for multiple-client rerun issue

# 0.11.1

* Updated to Chimp 0.10.1 which detects unhandled promise rejections and fixes 'chimp server' issue
* Results from bad chimp runs are now shown in the reporter
* Fix for hanging pulsating dot for specs that don't pass / are pending
* Improved logging

# 0.11.0

* Updated to Chimp 0.10.0 (includes Webdriver 3.0)
* Fixes multiple selenium server starting issues
* Chrome is now the default browser

# 0.10.0

* Fixes issue where Chrome takes the focus when screenshots for errors are taken (# 142)
* In development mode no screenshots are taken when you use a non-headless browser (Needed to fix # 142)

# 0.9.3

* Merged the parallel execution branch (**** yea!)

# 0.9.2

* Added a CUCUMBER_TAIL environment variable to tail the cucumber.log in the main console
* Added a INSTALL_DEPENDENCIES environment variable for CI build caching purposes
* Updated to latest chimp which uses updated Chai, Chai-as-promised, selenium, chrome/ie drivers

# 0.9.1

* Installs chimp dependencies on main process startup to support build caching on CI servers

# 0.9.0

* Automatically downloads npm dependencies when a package.json file is found in /tests/cucumber

# 0.8.1 - 0.8.9

* Ton of bug fixes
* Sorry for sloppy release note :)

# 0.8.0

* Uses latest cuke-monkey
* Works on Windows
* Updated examples to use new syntax

# 0.7.0

* Now using a long-running child process for cuke-monkey
* Moved process management logic to cuke-monkey
* Added a CUKE_MONKEY_SWITCHES env var to pass raw switches to cuke monkey
* Now watches @dev tags by default. VELOCITY_CI env var can be used on CI severs to run all tags
* Added direct cuke monkey arg passing

# 0.6.6

* Ignore files in tests/cucumber/node_modules

# 0.6.5

* Bumping cuke-monkey version

# 0.6.4

* Changes to app/test code will restart even stale cucumber runs
* Improved process management. Phantom/Selenium are now killed on app/test code changes

# 0.6.3

* Fixed console reporter issue

# 0.6.1 - 0.6.2

* Attempting to add docs to atmosphere

# 0.6.0

* Increased stability by using cuke-monkey npm package
* Rewrote the core
* Improved error messaging by reducing noise
* Works with the new Velocity mirrors
* Moved all runner code into the mirror
* Added experimental parallel testing mode
* Includes a DDP connection to the mirror by default
* Sample tests are much simpler now with a fixture, ddp and webdriver example
* Uses new smaller reporter
* Experimental support for parallel testing

# 0.5.5

* Fix for fs-extra

# 0.5.4

* Fixed compatibility with Meteor 1.0.4+ for client reloading
* Updated all dependencies
* Added fs-extra for lower level fs tests

# 0.5.3

* Fix for Module._cache busting (file changes not working)

# 0.5.2

* Upgraded cucumber.js to 0.4.8

# 0.5.1

* Bumping webdriver version

# 0.5.0

* Baked in Chai and Chai-as-promised into step defs

# 0.4.0

* Major bump of node-soft-mirror and webdriver versions

# 0.3.10

* Fixed issue with patching. bindEnvironment no longer needed

# 0.3.6

* Fixing error in sample tests

# 0.3.5

* Added ability to disable cucumber with CUCUMBER=0 env var
* Simplified the example world config
* Added a viewport sizing config in the hooks

# 0.3.4

* Fixed # 30 - Nasty bug that showed failures as passes!

# 0.3.1 - 0.3.3

* Bumping HTML reporter, webdriver and mirror versions

# 0.3.0

* Includes HTTP package for testing restful E2E calls
* Updated cucumber to version 0.4.7
* Now includes webdriver by default
* Example world sets up Webdriver

# 0.2.0 - 0.2.4

* Void (connection issues messed up build on package server)

# 0.1.1

* Fixed issue with mirror starting
* Improved logging
* Swapped lodash to underscore

# 0.1.0

* Actually using semvar now!
* Bumped velocity
* Logging now includes full package name

# 0.0.13

* Improved de-bouncing
* Updated sample tests

# 0.0.7-0.0.12
* Bumping versions

# 0.0.6
* Uses new soft mirror
* Runs steps in fibers (Auto wraps step definition callbacks with Meteor.bindEnvironment)

# 0.0.6
Bumping to velocity 1.0.0-rc4

# 0.0.5
Fixing versions

# 0.0.4
Using Velocity RC3

# 0.0.3
Now works with a mirror

# 0.0.2
Fixed sample test copying
Hid Before/After steps from showing when they don't error

# 0.0.1
Initial release. Simple cucumberjs + velocity integration
