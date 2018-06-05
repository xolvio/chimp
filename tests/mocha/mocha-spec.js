describe('Chimp Mocha', () => {
  describe('Page title', () => {
    it('should get the browser page title', () => {
      browser.url('http://google.com');
      expect(browser.getTitle()).to.equal('Google');
    });
  });

  describe('ES2015', function () {
    it('is supported', function () {
      const {a, b} = {a: 'foo', b: 'bar'};
      const arrowFunc = (foo) => foo;
      class Foo {
        constructor() {}
        foo() {}
      }
      var object = {
        foo() {}
      };
      const templateString = `Foo`;
      const [c, ,d] = [1,2,3];
    });
  });
});
