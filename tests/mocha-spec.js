describe('Chimp Mocha', function() {
  describe('Page title', function () {
    it('should be set by the Meteor method @watch', function () {
      server.call('updateTitle', 'My Title');
      browser.url(process.env.ROOT_URL);
      expect(browser.getText('h1')).to.equal('My Title');
    });
  });
});
