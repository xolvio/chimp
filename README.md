# Chimp.js [![Circle CI](https://circleci.com/gh/xolvio/chimp.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/xolvio/chimp)  [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/xolvio/chimp?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
An awesome developer-centric experience to writing tests with **realtime feedback** using Mocha or Cucumber.js (Jasmine soon).

![Chimp by Xolv.io](./images/header.png?raw=true)
 
Chimp can be used with *any technology stack* as it allows your to write your test automation in the language of the web: JavaScript.

### Realtime feedback?
Traditionally only available for unit testing, and now you can get super fast feedback for your acceptance and end-to-end tests:

![Realtime feedback](./images/realtime.gif?raw=true) 

Set an `@focus` tag in the spec title, save a file, Chimp reruns the spec until you make it pass. 

### Installation

```sh
npm install -g chimp
```

Be sure to checkout our [Automated Testing Best Practices](https://github.com/xolvio/automated-testing-best-practices) repository.

Having trouble? See the [installation documentation](https://chimp.readme.io/docs/installation).

### Usage

For development mode, you can use the watch mode:
```sh
chimp --watch
```
You can also easily change the browser Chimp with `--browser`, e.g. `--browser=phantomjs`

### Documentation

Read the full [documentation site](http://chimp.readme.io/docs). 

*(Thank you to [Readme.io](Readme.io) for the OSS <3)*

## Additional Features

###### Synchronous Javascript
![WebdriverIO](./images/wdio.png?raw=true)

We chose [WebdriverIO](http://webdriver.io) for it's awesome API and made it awesomer by converting it to a synchronous syntax: 

```javascript
browser.url('http://google.com'); // SETUP

var title = browser.getTitle();   // EXECUTE

expect(title).to.equal('Google'); // VERIFY
```

No callback-hell or confusing assertions with promises, just easy-to-read synchronous code that works as you expect it to.

###### Easy CI
![CI](./images/ci.png?raw=true)

Chimp is tested on all the popular CI servers. We genuinely just want you to focus on writing tests and let us deal with all the boring bits!

###### Mocha or Cucumber.js (Jasmine soon)
![Test Frameworks](./images/test-frameworks.png?raw=true)

Some developers love Jasmine and Mocha, and some teams love to use Cucumber for BDD. We decided to give you the choice between the best in class test frameworks for writing end-to-end and acceptance tests. 

###### Client & Server

End-to-end and acceptance testing often require you to setup data on the server and reset state between specs. 

Using our synchronous version of the [request module](https://www.npmjs.com/package/request#request-options-callback), you can call your server to reset your system or setup data like this:
  
```javascript
var userId = request({
  url: 'http://localhost:3000/fixtures/createUser'
  method: 'POST',
  json: true,
  body: {username: 'Bob', password: 't0ps3cret'}
});
```

Or if you are using Meteor, you can get fancy with our `server.execute` method:

```javascript
var privateSetting = server.execute(function(settingKey) {
  return Meteor.settings[settingKey];
}, 'privateSetting')
```

###### Lots more
Chimp is PACKED with features that make your life easier. See the [documentation site](http://chimp.readme.io/docs) for more details.

## Using Meteor?

Chimp comes with first-grade Meteor support out-of-the-box, including hot-deploy detection that runs specs after your Meteor client or server restart. 

Be sure to checkout our [Automated Testing Best Practices](https://github.com/xolvio/automated-testing-best-practices) repository which is written using Meteor.

### Usage

In development mode, use the watch mode:
```sh
# start your Meteor app first
chimp --watch --ddp=http://localhost:3000
```

On CI, can select the browser:
```sh
# start your Meteor app first
chimp --browser=firefox --ddp=http://localhost:3000
```

## Get our Meteor Testing Book
To learn more about testing with Meteor, consider purchasing our book [The Meteor Testing Manual](http://www.meteortesting.com/?utm_source=GitHubChimp&utm_medium=banner&utm_campaign=Chimp).

[![](http://www.meteortesting.com/img/tmtm.gif)](http://www.meteortesting.com/?utm_source=GitHubChimp&utm_medium=banner&utm_campaign=Chimp)

Your support helps us continue our work on Chimp.

## Need Faster Builds?
 
Check our our [WhirlWind](https://github.com/xolvio/whirlwind) package that can bring a build time down from hours to 
minutes!
