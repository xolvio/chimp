module.exports = function () {

  this.When(/^I use ES2015$/, function () {
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

  this.When(/^it works$/, function () {});

};
