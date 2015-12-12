[![Chimp by Xolv.io](./images/header.png?raw=true)](http://chimpjs.com)

[![Circle CI](https://circleci.com/gh/xolvio/chimp.svg?style=svg)](https://circleci.com/gh/xolvio/chimp) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/xolvio/chimp?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

This package allows you to easily write the automating code in BDD using Cucumber.js or Mocha (Jasmine soon). 

You can use chimp with any technology stack since it allows your to write your automation layer in JavaScript ( the language of the web.)

[Click here to see a demo](http://chimpjs.com).


## Installation

You need to be sure you have the following prerequisite installed:

* Node & NPM
* Oracle Java 1.8+ - you need the JDK not JRE or the OpenJDK
* Google Chrome (or you can set the `--browser` flag and use any other browser like `firefox`, `phantomjs` and `safari`)

```sh
npm install chimp
```

## Usage

For development mode, you can use the watch mode:
```sh
./bin/chimp --watch
```

On CI you can select the browser:
```sh
./bin/chimp --browser=firefox
```

## Documentation
You can read [read the full documentation here](http://chimp.readme.io/docs).


# Using Meteor?

Chimp comes with first-grade Meteor support out-of-the-box. You simply start chimp like this:

## Usage

For development mode, you can use the watch mode:
```sh
./bin/chimp --watch --ddp=http://localhost:3000
```

On CI you can select the browser:
```sh
# start your Meteor app first
./bin/chimp --browser=firefox --ddp=http://localhost:3000
```

## Get our Meteor Testing Book
To learn more about testing with Meteor, consider purchasing our book [The Meteor Testing Manual](http://www.meteortesting.com/?utm_source=GitHubChimp&utm_medium=banner&utm_campaign=Chimp).

[![](http://www.meteortesting.com/img/tmtm.gif)](http://www.meteortesting.com/?utm_source=GitHubChimp&utm_medium=banner&utm_campaign=Chimp)

Your support helps us continue our work on Chimp.

## Need Faster Builds?
 
Check our our [WhirlWind](https://github.com/xolvio/whirlwind) package that can bring a build time down from hours to 
minutes!
