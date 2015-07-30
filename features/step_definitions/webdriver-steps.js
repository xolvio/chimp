var myStepDefinitionsWrapper = function () {

  this.When(/^I visit "([^"]*)"$/, function (url) {
    this.client.url(url);
  });

  this.Then(/^I see the title of "([^"]*)"$/, function (title) {
    expect(this.client.getTitle()).to.equal(title)
  });

};
module.exports = myStepDefinitionsWrapper;
