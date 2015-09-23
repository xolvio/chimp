var myStepDefinitionsWrapper = function () {

  this.When(/^I visit "([^"]*)"$/, function (url) {
    browser.url(url);
  });

  this.Then(/^I see the title of "([^"]*)"$/, function (title) {
    expect(browser.getTitle()).toEqual(title);
  });

};
module.exports = myStepDefinitionsWrapper;
