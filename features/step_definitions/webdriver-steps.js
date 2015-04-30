var myStepDefinitionsWrapper = function () {

  this.When(/^I visit "([^"]*)"$/, function (url, callback) {
    this.browser.
      url(url).
      call(callback);
  });

  this.Then(/^I see the title of "([^"]*)"$/, function (title, callback) {
    this.browser.
      getTitle().should.become(title).and.notify(callback);
  });

};
module.exports = myStepDefinitionsWrapper;
