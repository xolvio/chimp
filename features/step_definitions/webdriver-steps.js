var myStepDefinitionsWrapper = function () {

  this.When(/^I visit "([^"]*)"$/, function (url) {
    client.url(url);
  });

  this.Then(/^I see the title of "([^"]*)"$/, function (title) {
    expect(getTitle()).to.equal(title);
  });

};
module.exports = myStepDefinitionsWrapper;
