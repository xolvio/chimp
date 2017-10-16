# Chimp 2.0

## Priorities

### Must
* [ ] Add linting to the test cycle
* [ ] Setup on CI (Circle or Travis)
* [x] Rewrite `ChromeDriver` process management spike using TDD
* [x] Rewrite `BrowserFactory` spike using TDD
* [ ] Rewrite `DDP` module using using TDD
* [ ] Externalize *all* configs (timeouts etc)
* [ ] Put decent logging system in place
* [ ] Cucumber simple watch module (using @watch tags and all file changes) - Instructions for Gulp/Grunt
* [ ] Amazing documentation + examples
  * [ ] Diagrams + text showing how Chimp works
  * [ ] Migration instructions from Chimp 1.0 > 2.0
  * [ ] Detailed options docs
  * [x] Example of imports, debug mode etc
  * [x] Meteor DDP connections example
  * [ ] Where to go for other framework docs
  * [ ] Selenium Server integration
  * [ ] SauceLabs integration
  * [ ] BrowserStack integration
  * [ ] TestingBot integration

### Should
* [ ] Add colors library for messaging
* [ ] Add supported browser matrix testing on CI
* [ ] Add supported Node versions matrix testing on CI
* [ ] Log output to file from `LongRunningProcess`
* [ ] Make it work for other browsers (Firefox, Safari, IE)
* [x] Add Jasmine support (as well as Jest)

### Could
* [ ] DDP watcher - restarts when Meteor reloads (generalize for other frameworks too)
* [ ] Cucumber smart watch mode (using code coverage Wallaby style)  
* [ ] Session reuse module (belongs in Webdriver.io)
* [ ] Appium support (a downloader like Selenium)

## Plan
* *alpha release* 
  * [ ] Announce now
* *beta release*
  * [ ] Complete all tasks in the "Must" section and announce 
* *public 2.0 release* 
  * [ ] Used on 2+ Xolv.io/Brain client code bases
  * [ ] Complete working through feedback from above users 
  * [ ] Complete all tasks in the "Should" section
  * [ ] Deprecate Chimp 1.x