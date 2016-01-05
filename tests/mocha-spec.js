describe('Chimp Mocha', function() {
  describe('Page title', function () {
    it('should be set by the Meteor method @watch', function () {
      browser.url('http://google.com');
    });
  });
});
