describe('Chimp Mocha', function() {
  describe('Page title', function () {
    it('should be set by the Meteor method @watch', function () {
      browser.url('http://google.com');
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
