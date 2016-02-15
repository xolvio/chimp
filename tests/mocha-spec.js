describe('Chimp Mocha', () => {
  describe('Page title', () => {
    it('should be set by the Meteor method @watch', () => {
      browser.url('http://google.com');
    });
  });
});
