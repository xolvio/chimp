module.exports = function () {

  // You can use normal require here, cucumber is NOT run in a Meteor context (by design)
  var url = require('url');

  this.Given(/^I have authored the site title as "([^"]*)"$/, function (title) {
    // server is a synchronous ddp is a connection to the mirror
    server.call('updateTitle', title);
  });

  this.When(/^I navigate to "([^"]*)"$/, function (relativePath) {
    // process.env.ROOT_URL always points to the mirror
    browser.url(url.resolve(process.env.ROOT_URL, relativePath));
  });

  this.Then(/^I should see the heading "([^"]*)"$/, function (expectedTitle) {
    browser.waitForExist('h1');
    expect(browser.getText('h1')).toEqual(expectedTitle);
  });

};
