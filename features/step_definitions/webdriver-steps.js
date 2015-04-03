var myStepDefinitionsWrapper = function () {

  this.When(/^I visit "([^"]*)"$/, function (url, callback) {
    this.browser.
      url(url).
      call(callback);
  });

  this.Then(/^I see the title of "([^"]*)"$/, function (title, callback) {
    this.browser.
      getTitle().should.become(title).
      notify(function(){
        console.log(this);
        callback();
      }, function() {
        console.log(this,arguments)
      });
  });

};
module.exports = myStepDefinitionsWrapper;