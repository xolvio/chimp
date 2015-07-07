![Chimp by Xolv.io](https://raw.githubusercontent.com/xolvio/chimp/develop/header.png "Chimp by Xolv.io")

[![Join the chat at https://gitter.im/xolvio/chimp](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/xolvio/chimp) 
[![Circle CI](https://circleci.com/gh/xolvio/chimp.svg?style=svg)](https://circleci.com/gh/xolvio/chimp)

Chimp is an end-to-end acceptance testing package that makes it so easy to write end-to-end 
specifications, that even a primate could do it!

It does so by seamlessly integrating CucumberJS, Selenium, WebdriverIO and Chai-as-promised to work 
in unison. It's designed to take away all the pain that comes with setting up these tools to play 
nicely together, and gives you the following:

* A unique watch mode reruns only the specs you tag, allowing you to stay hyper-focused on the feature you're working on

* Uses Promises everywhere for a super fluent clean syntax

* Comes with [Chimp-Widgets](https://github.com/xolvio/chimp-widgets) to help you maintain tidy autmoation code

* Full Continuous Integration server support

* Automatically downloads Selenium / Chrome / IEDriver / PhantomJS when you don't have them

* Works on OSX, Linux and Windows

* SauceLabs / BrowserStack / Selenium Grid support out the box

* Built specifically for Node.js and Meteor apps (works for other platforms too)

* Intelligently reuses browser sessions so you don't get annoying window-flicker whilst running your specs

* Automatically takes a screenshot on CI servers when a step fails

* Integrates with [Simian.io](http://simian.io), allowing your whole team to collaborate over specs and truly have a company-wide BDD practice

We use Chimp internally and we are in the business of specs. We take care of integrating the tools so you can focus on the important parts.

## Try it

####1. Install

Make sure you have Node.js and NPM installed and type this in the terminal: (you may need to run as a super user depending on your setup)

```bash
npm install -g chimp
```

You can also include chimp on a per-project basis by adding it to your `package.json` file.


####2. Develop
Chimp assumes you have a folder called `./features` in the directory you run it from where your 
CucumberJS feature and support files reside. If you don't have any feature files or don't know what 
that is, please see the [Key Concepts section](#key-concepts) below and then run through the 
[tutorial](#tutorial) to get up to speed.

From your project root, type:

```bash
chimp --watch
``` 

Chimp will watch your feature & supporting files directory and rerun any features/scenarios that 
have the tag `@watch`.

By default, Chimp starts a Google Chrome browser window. This is where your specs will run and 
you can use this window to see the automation as it happens. Chimp also ensures the same window will 
remain open between your specs rerunning so you won't get an annoying window popup. 

The watch mode is designed to keep you focused on the task at hand. The idea is you work on a 
scenario through to completion, and then move the `@watch` tag to the next scenario.

####3. Test
You've now finished your tasks and are ready to commit your code. If you want to run the build 
locally you can run all the tests using this command:

```bash
chimp --browser=firefox
```

Chimp recognizes that you're not in watch mode and will run all specs, except those with the 
`@ignore` tag.

Notice how you can use a different browser. It's a good practice to develop using one browser and 
run all tests with another. 

This same command can also be used on CI servers. You can tell Chimp to output the CucumberJS report 
to a JSON file like this:
 
```bash
chimp --jsonOutput=cucumber_output.json
```
 
This is a good build artifact to keep for traceability, especially on CircleCI where these files are 
natively supported. 

## Use it

####Key Concepts

Chimp gives you the following opinionated tool combination:

CucumberJS + WebdriverIO + Selenium / PhantomJS + Chai & Chai-As-Promised

* You use CucumberJS to define specifications and the automation layer
* In the automation layer you use WebdriverIO to control a browser
* You can choose any real browser like Chrome or Firefox using Selenium, or you can use PhantomJS
* You also have access to a DDP connection in the automation layer in case you are using Meteor
* You can use npm libraries to talk to REST servers or any other protocols in your stack 
* You get clean callback-less promise-based assertions using Chai and Chai-as-promised in the automation layer
* The baked-in chimp-widget library provides reusable high-level commands for UI testing

Below you will find an overview of each package used and an example of how to use it.

######CucumberJS
Cucumber is a framework for defining behavior using a language called Gherkin. The Gherkin syntax
uses a combination of keywords and natural language.

Feature files with a `.feature` extension contain the Gherkin syntax. Consider this feature file:

```gherkin
Feature: One-line description of the feature

  Anything can be used here to provide context for this specification. You may want to use the 
  infamous story format that looks like this:
  
  As an <actor>
  I want <feature>
  So that <benefit>

  Background: The background is optional
    Given something that happens before every scenario
    And something else that happens before every scenario

  Scenario: One-line description of the scenario
    Given some pre-condition with a parameter "myParam"
    And another pre-condition
    When an event is triggered
    Then an expected result happens
    But an unexpected result does not happen
```

Some things to note about this feature file:
* It is the specification of a single feature for the application / system
* A feature can have freeform context before scenarios are defined. This content does not have any affect on the automation layer
* A feature has many scenarios. Each scenario is a unique flow within the feature
* A scenario has many steps. 
* A step starts with a keyword and contains freeform text
* A feature may contain an optional background which also contains steps 

Steps are the bridge between the feature and the automation layer. They are automated using step 
definition files. The step definitions can be defined either in javascript or coffee using the 
`--coffee` switch. Here is an example:

```javascript
this.Given(/^some pre\-condition with a parameter "([^"]*)"$/, function (arg1, callback) {
  // Write code here that turns the phrase above into concrete actions
  callback.pending();
});
```

You will notice the step definition above uses regex to match the step in the feature file. The 
regex can also extract parameters from the freeform text. The Gherkin syntax also supports tables 
and multi-line strings amongst other constructs. You can read more about the Gherkin syntax in the 
[additional reading section](#gherkin-syntax-information). 

This is a very brief overview of Cucumber and the Gherkin syntax. Be sure to check out the 
[further reading](#further-reading) section for additional learning resources on the wonderful
subject of Behavior Driven Development (BDD).

######WebdriverIO

######Selenium / PhantomJS

######Chai / Chai-as-promised

######Chimp Widgets
https://github.com/xolvio/chimp-widgets
 
####Architectural Overview
 
 Chimp

  # Chimp Run
  
    If Single
      Run everything and cleanly kill all the processes when done
      
    If Watch mode
      Watch feature/support files and manage process interruption and spec reruns
      
    If Server mod
      Listen for HTTP requests and run/interrupt/rerun 
      
  # Browser Setup  
  
    If PhantomJS is selected
      Contains a binary for all platforms (OSX/Linux/Windows)
      Starts PhantomJS on a random port in Webdriver mode
    
    If Selenium is selected
      Downloads Selenium for host architecture
      Downloads ChromeDriver for host architecture
      Downloads IEDriver (Windows only)
      Starts Selenium on a random port
        Manages selenium-server and browser child processes 
    
  # Cucumber Run
  
    Augments World object      
      Adds Chai & Chai-as-promised and configures them
      Adds a session manager
        Intelligently wait for connections to remote servers like SauceLabs
        Connects WebdriverIO to the selenium server
        Reuses sessions for real-browsers when in watch mode
        
      Adds ability to publish a JSON report to
        File system
        Simian.io
 
 
####Tutorial
 
 Create this file and save it under `./features/search.feature`
 ```gherkin
 Feature: Visitors can search the web
 
   As a searcher
   I want to find websites
   So I can visit their homepage
 
   @watch
   Scenario: Users can find websites
     Given I have navigated to Google
     When I search for Xolv.io
     Then I see a link to the Xolv.io website in the results
 ```
 
 
 
 
 
## Configure it

Chimp and the integrated packages are all configurable through the command-line. Although Chimp is 
somewhat opinionated, it tries to be as flexible as possible for advanced users. Below are the 
supported options.   

#### Chimp
 
#### Cucumber

#### WebdriverIO


Full list of API
http://www.webdriver.io/api.html

You can see more info at the official [WebdriverIO](http://webdriver.io/) website.
 
#### Selenium

#### PhantomJS
 
 
 
Chimp Server

 
- [SauceLabs](https://saucelabs.com) 
- [Simian](http://simian.io) - Coming Soon: Send test results to Simian from your CI environment to enable a company-wide BDD practise
- [Meteor Velocity](https://github.com/xolvio/meteor-cucumber/)
- [CucumberJS](https://github.com/cucumber/cucumber-js)

- [Chai](http://chaijs.com/)
- PhantomJS
- Selenium  
- Chai-As-Promised


All CLI options from **CucumberJS** are available to you through **Chimp**.
--r/--require
/features/file/etc

--snippets

--ddp=process.env.ROOT_URL
--log=error
--debug
--screenshotsPath
--coffee
--tags=@dev
--tags=~@ignore
--f / format
--timeoutsAsyncScript
--browser
--host=process.env.HUB_HOST
--port=process.env.HUB_PORT
--user=process.env.HUB_USER
--key=process.env.HUB_KEY
--platform=process.env.HUB_PLATFORM
--version=process.env.HUB_VERSION
-
-`HUB_HOST=ondemand.saucelabs.com | localhost (default)`
-`HUB_PORT=xxxx | 80 | 4444 (default)`
-`HUB_USER=dude`
-`HUB_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx`
-`HUB_PLATFORM='Windows 7' | 'OS X 10.8' | ANY (default)`
-`HUB_VERSION=35`
-
-`CUCUMBER_FORMAT=summary | json | progress | pretty (default)`
-`CUCUMBER_COFFEE_SNIPPETS=1`
-`CUCUMBER_TAGS=@mytag,@myOtherTag,~@notThisTag`
-`CUCUMBER_SCREENSHOTS_DIR=./tests/cucumber/.screenshots (default)`
-
-  long: ['require', 'format', 'progress', 'tags', 'help', 'strict', 'version', 'coffee', 'snippets'],
-  short: ['r', 'f', 't', 'h', 'S', 'i']
-
-`WD_LOG=command/debug/silent (default)`
-`WD_TIMEOUT_ASYNC_SCRIPT=10000 (default)`
-
---deviceName | --browser
-
---log=debug|info|error
-
---phantom_w
---phantom_h
-
---jsonOutput
-
-waitForTimeout
-
---watch
-watchTags : @dev
-
---noSessionReuse
-
---screenshotsPath
-
---server
-serverHost
-serverPort


#### Chimp Options

##### path

The path to your local `CucumberJS` features directory.

- **command**: `--path`
- **default**: `./features`
- **example usage:**
```
chimp --path='tests/acceptance/features'
chimp --path='tests/features'
```

##### browser

The browser to use. The available options are `phantomjs`, any browser on your local
machine such as `chrome`, `firefox` or any browser available to SauceLabs.

- **command**: `--browser`
- **default**: `phantomjs`
- **example usage**:
```
chimp --browser=firefox // would use local firefox instance
chimp --browser=chrome // would use local chrome instance
```
- **notes**
  - Selenium comes bundled with a driver for `firefox`. For other browsers
  you will have to download those drivers.
  - [full list of 3rd party bindings](http://www.seleniumhq.org/download/)

##### host

The host domain that points to your Selenium Grid or SauceLabs hub url. Ignore this if your using
`phantomjs` or local `selenium`.

- **command**: `--host`
- **default**: `localhost`
- **example usage:**
```
chimp --host=ondemand.saucelabs.com
```

##### port

The port that used in conjunction with your host. Ignore this if your using
`phantomjs` or local `selenium`.

- **command**: `--port`
- **default**: `4444`
- **example usage:**
```
chimp --port=80
```

##### user

The user credentials to send to SauceLabs or authenticated grid environment.

- **command**: `--user`
- **default**: ``
- **example usage:**
```
chimp --user=eric
```

##### key

The accessKey to send to SauceLabs or authenticated grid environment.

- **command**: `--key`
- **default**: ``
- **example usage:**
```
chimp --key=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx
```

##### platform

If your remote URL is a SauceLabs or Selenium Grid endpoint you may wish to request
a specific platform to run your tests on. If running tests on your local machine this
is ignored. See [SauceLabs supported platforms](https://saucelabs.com/platforms)

- **command**: `--platform`
- **default**: `ANY`
- **example usage**:
```
chimp --platform='Windows 7'
chimp --platform='OS X 10.8'
```

Type: `String` Default: **ANY**

##### version

If using a **Selenium Grid** or Grid providers such as **SauceLabs** you may wish to
request a specific version of a `browser`.

- **command**: `--version`
- **default**: `ANY`
- **example usage**:
```
chimp --browser='firefox' --version='35' --remote='http://user:key@ondemand.saucelabs.com/wd/hub'
chimp --browser='chrome' --version='35' --remote='http://yourseleniumhub.com:4444/wd/hub'
```

##### name
If using a **Selenium Grid** or Grid providers such as **SauceLabs** you may wish to assign
a test name. In SauceLabs for instance this will appear in your test rules dashboard.

- **command**: `--name`
- **default**: `unknown`
- **example usage**:
```
chimp --name='Acceptance Tests' --browser='firefox' --remote='http://user:key@ondemand.saucelabs.com/wd/hub'
```

##### log
Whether or not to display debug information. Namely `Webdriver` commands.

- **command**: `--log`
- **default**: `silent`
- **options**: `silent`, `command`
- **example usage**:
```
chimp --log=command
```

##### screenshotsOnError
Whether or not to save screenshots on errors.

- **command**: `--screenshotsOnError`
- **default**: `false (true for phantomjs)`
- **options**: true, false
- **example usage**:
```
# Enable screenshots
chimp --screenshotsOnError=true
# Disable screenshots
chimp --screenshotsOnError=false
```

#### CucumberJS Options

Unfortunately the docs for CucumberJS don't list the CLI options, however the source for the argument
parser contains a list of all the options.
[Click here](https://github.com/cucumber/cucumber-js/blob/master/lib/cucumber/cli/argument_parser.js#L132)
to see the source.



## Further Reading

####Gherkin Syntax Information
* [The Gherkin syntax](https://github.com/cucumber/cucumber/wiki/Gherkin) wiki pages

####Great Articles
* [Behaviour Driven Development](http://lizkeogh.com/behaviour-driven-development/) by Liz Keogh
* [Acceptance Criteria vs Scenarios](http://lizkeogh.com/2011/06/20/acceptance-criteria-vs-scenarios/) by Liz Keogh

####Books
* [The Cucumber Book](https://pragprog.com/book/hwcuc/the-cucumber-book) by Matt Wynne and Aslak Hellesøy
* [Specification by Example](http://www.manning.com/adzic/) by Gojko Adzic (Use this code: cukes38sbe for 38% off)

####Official Resources
* [Cucumber-js](https://github.com/cucumber/cucumber-js) repository
* [Cucumber Official Website](https://cucumber.io/) website
* [BDD Google Group](https://groups.google.com/forum/#!forum/behaviordrivendevelopment)
* [Cucumber School](https://cukes.info/school)
* [Cucumber Blog](https://cucumber.io/blog)


## Contributing
Fork the repo, issue a pull request with passing tests.


## Credits
This project was originally forked from [Eric Clifford](https://github.com/eclifford)'s excellent
[Cuked](https://github.com/eclifford/cuked). Many thanks for his efforts.
