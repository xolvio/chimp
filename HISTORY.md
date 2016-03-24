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
