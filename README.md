# Chimp by Xolv.io

[![Circle CI](https://circleci.com/gh/xolvio/chimp.svg?style=svg)](https://circleci.com/gh/xolvio/chimp)

Chimp is a BDD acceptance testing package that combines CucumberJS, PhantomJS, WebdriverIO and 
Chai. It works as a standalone npm package for use in any project.

If you are using Meteor, you should see [xolvio:cucumber](https://github.com/xolvio/meteor-cucumber/)

Chimp can be used locally or configured to use [Simian](http://simian.io) and 
[SauceLabs](https://saucelabs.com). See below for more details.

## Features
- Write your feature specs and step definitions with [CucumberJS](https://github.com/cucumber/cucumber-js)
- Use the powerful [WebdriverIO](http://webdriver.io/) fluent chain-able API
- Write your assertions beautifully in a human readable format using the power of [Chai](http://chaijs.com/)
- Leverage the power of PhantomJS, Selenium, SauceLabs for seamless integration between optimized local development
and full continuous integration support.
- Use promises everywhere
- DDP support for Meteor projects
- Coming Soon: Send test results to Simian from your CI environment to enable a company-wide BDD practise

## Quick Start

### Installation

For CLI installation:
```bash
npm install chimp -g
```

You can also include chimp on a per-project basis by adding it to your `package.json` file.

### Usage

Be sure to be inside a project that contains a `/features` directory and supporting files then:

```bash
chimp
```

Chimp provides just enough native options to better facilitate the synergy between **CucumberJS**,
**PhantomJS**, **Selenium**, **SauceLabs**, and **WebdriverIO**. However all other CLI options are
passed through to their respective binaries. This means that all CLI options from **CucumberJS**,
**PhantomJS**, and **Selenium** are available to you through **Chimp**.

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

#### CucumberJS Options

Unfortunately the docs for CucumberJS don't list the CLI options, however the source for the argument
parser contains a list of all the options.
[Click here](https://github.com/cucumber/cucumber-js/blob/master/lib/cucumber/cli/argument_parser.js#L132)
to see the source.

#### PhantomJS Options

[full list](http://phantomjs.org/api/command-line.html)

#### Selenium CLI Options

[full list](https://code.google.com/p/selenium/wiki/Grid2)


## FAQ


## Contributing

Fork the repo and issue a pull request


## Credits

This project is originally forked from [Eric Clifford](https://github.com/eclifford)'s excellent
[Cuked](https://github.com/eclifford/cuked), and has been modified to work with Simian and Velocity.
Many thanks and all due Kudos go to Eric. In his words, he described the original project as:

"Chimp is an alternative to monolithic testing frameworks that trap you into proprietary abstractions
and API's. Chimp is built from the ground to synergize CucumberJS with the other industry standard
micro-libraries you know and love."

Xolv.io aims to maintain this vision for this project.
