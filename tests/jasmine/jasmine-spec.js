describe('Chimp Jasmine', () => {
  describe('Page title', () => {
    it('should be set by the Meteor method', () => {
      browser.url('http://google.com');
      expect(browser.getTitle()).toBe('Google');
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
