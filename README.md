# Chimp.js
[![Circle CI](https://circleci.com/gh/xolvio/chimp.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/xolvio/chimp) [![npm Version](https://img.shields.io/npm/dm/chimp.svg)](https://www.npmjs.com/package/chimp) [![License](https://img.shields.io/npm/l/chimp.svg)](https://www.npmjs.com/package/chimp) [![Gitter](https://img.shields.io/gitter/room/xolvio/chimp.svg)](https://gitter.im/xolvio/chimp)  [![Slack Status](http://community.xolv.io/badge.svg)](http://community.xolv.io)


An awesome developer-centric experience to writing tests using Mocha, Jest, Jasmine or Cucumber.js.

![Chimp by Xolv.io](./images/logo.png?raw=true)

Chimp makes it super easy for developers to write browser automation tests, by taking away all the pain associated with setting up tools and allowing developers to focus on building-in quality.


## Getting started
### 1. Install Chimp in your project:

```
npm i --save-dev chimp@next 
```
*Note: the `@next` tag will be removed once Chimp 2.0 is released.*

### 2. Import the Chimp browser
Use the import statement that matches the test framework you're using: 
```javascript
import browser from 'chimp/mocha/browser'     // Mocha
import browser from 'chimp/jest/browser'      // Jest
import browser from 'chimp/jasmine/browser'   // Jasmine   
import browser from 'chimp/cucumber/browser'  // Cucumber
```

### 3. Use the browser object:
You get a fully initialized headless Chrome browser that you can automate using the excellent [Webdriver.io API](http://webdriver.io/api.html) and you use `async/await` like this to manage asynchrony: 

```javascript
describe('Xolv.io Website', function () {
  it('should have a title', async function () {
    await browser.url('https://xolv.io');

    const title = await browser.getTitle();

    expect(title).toEqual('Xolv.io');
  });
});
```

That's it! 

No command line runner, no complex tools to setup, you simply import the Chimp browser into yout test and it just works.

### Debugging
Need to see what the browser is doing? No problem, just append `.debug` to your browser import like this:

```javascript
import browser from 'chimp/xxxx/browser.debug';
````

Chimp will give you a non-headless browser so you can do your job. This is very powerful when it's used with [Webdriver.io's REPL debug method](http://webdriver.io/api/utility/debug.html).

### Other browsers
> *NOTE: This feature is still in development and not yet ready*
By default, Chimp starts a [chromedriver](https://sites.google.com/a/chromium.org/chromedriver/) instance for you. If you would like to use other browsers like `firefox`, `safari` and `msie`, then you need to tell Webdriver.io to set the `desiredCapabilities` configuration in the `chimp.js` configuration. For example, if you wanted to use Firefox, your `chimp.js` file would look like this:
```javascript
export default {
  webdriverio: {
    desiredCapabilities: {
      browserName: 'firefox'
    }
  }
}
```

When Chimp sees that you've used a different browser than chrome, it will automatically download and start Selenium for you. 

### The `chimp.js` configuration file
> *NOTE: This feature is still in development and not yet ready*
To configure Chimp and the tools & libraries that it uses, you need to create a `chimp.js` config file that looks like this:
```javascript
export default {
  chimp: {
    // see below
  },
  webdriverio: {
    // see below
  },
  meteor: {
    // see below
  }
}
```

#### Configuration options
> *NOTE: This feature is still in development and not yet ready*
##### chimp
TODO

##### webdriverio
Chimp passes any configuration you place in here directly to Webdriver.io. [Please see the Webdriver.io configuration documentation](http://webdriver.io/guide/getstarted/configuration.html) to see what's available.

##### meteor
TODO

### Using Meteor?
Chimp has evolved from a Meteor project and we will always provide 1st class support for Meteor. You can get access to a DDP connection by doing the following:

```javascript
import server from 'chimp/mocha/meteor/server'    // Mocha
import server from 'chimp/jest/meteor/server'     // Jest
import server from 'chimp/jasmine/meteor/server'  // Jasmine
import server from 'chimp/cucumber/meteor/server' // Cucumber
``` 

Then you can use this `server` object to make DDP calls like this:

```javascript
const result = await server.call('your-meteor-method');
```
#### Executing remote code
> *NOTE: This feature is still in development and not yet ready*
And if you install the `xolvio/backdoor` Meteor package, you can also run code directly on the server like this:
```javascript
// write a function you'd like to run on the server
function getMeteorSettings(setting) {
  return Meteor.settings[setting]
}

// use server.execute to call the function within the Meteor context with parameters if needed
const mongoUrl = server.execute(getMeteorSettings, 'mongoUrl');

// returned values come back from the function that ran in the Meteor context
console.log(mongoUrl);
```

---

## Chimp Developers Guide:
We've made it easy for you to get ready to submit PR's and develop Chimp features. To get up and running, follow these steps:

We develop on the latest versions of everything (Node, NPM and packages), and we use tests to ensure backwards compatibility on CI.

1. Make sure you're on the latest version of Node and NPM. We recommend using [NVM](https://github.com/creationix/nvm).
2. `git clone git@github.com:xolvio/chimp.git` 
3. `npm run setup` - [See below](#npm-run-setup`) 
4. `npm run watch` - [See below](#npm-run-watch`)

You can now make changes to the sourcefiles in the Chimp directory and use the `./test-project` directory to use features within testing frameworks. 

Within the `test-project` directory, you can run the following npm scripts:
```bash
# run all test frameworks
npm test

# run individual test frameworks
npm run mocha
npm run jest
npm run jasmine
npm run cucumber
```

### Available NPM Scripts
The following scripts are available to you as a developer to help you with submitting new features and PR's. See below for a description of each:

###### `npm run clean`
TODO 

###### `npm run transpile`
TODO 

###### `npm run watch`
TODO 

###### `npm run test`
TODO 

###### `npm run prebpulish`
TODO 

###### `npm run install`
TODO 

###### `npm run setup`
TODO 

###### `npm run reset`
TODO 


## Releasing
npm publish --tag next


