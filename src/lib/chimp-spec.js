const Chimp = require('./chimp');

describe('Chimp', function () {
  before(function () {
    const emptyFn = function () {
    };
    td.replace('async', {});
    td.replace('path', {resolve: emptyFn, join: emptyFn});
    td.replace('chokidar', {});
    td.replace('underscore', {});
    td.replace('./log', {});
    td.replace('freeport', {});
    td.replace('xolvio-ddp', {});
    td.replace('hapi', {});
    td.replace('./ddp-watcher', {});
    td.replace('colors', {});
    td.replace('./boolean-helper', {});
    td.replace('./mocha/mocha.js', {});
    td.replace('./jasmine/jasmine.js', {});
    td.replace('./cucumberjs/cucumber.js', {});
    td.replace('./phantom.js', {});
    td.replace('./chromedriver.js', {});
    td.replace('./consoler.js', {});
    td.replace('./selenium.js', {});
    td.replace('./simian-reporter.js', {});
  });
  describe('constructor', function () {
    beforeEach(function () {
      this.chimp = new Chimp();
    });
    it('should create a new instance', function () {
      expect(this.chimp).not.to.equal(null);
    });
    it('should initialize a processes array', function () {
      expect(this.chimp.processes).to.be.instanceof(Array);
    });
    it('should initialize an options object if no options are provided', function () {
      expect(this.chimp.options).to.be.instanceOf(Object);
    });
    it('should store the options object if provided', function () {
      const myOptions = {};

      const chimp = new Chimp(myOptions);

      expect(chimp.options).to.equal(myOptions);
    });
    it('should store all the provided options on the environment hash prefixed with [chimp.]', function () {
      const myOptions = {a: 1, b: 'aString'};
      const chimp = new Chimp(myOptions);

      expect(process.env['chimp.a']).to.equal(myOptions.a.toString());
      expect(process.env['chimp.b']).to.equal(myOptions.b);
    });
    it('puts single ddp option on the environment hash as [chimp.ddp0] if only one provided', function () {
      const myOptions = {
        ddp: 'http://host:port'
      };

      const chimp = new Chimp(myOptions);

      expect(process.env['chimp.ddp0']).to.equal(myOptions.ddp.toString());
      expect(process.env['chimp.ddp1']).to.be.undefined;
    });
    it('puts multiple ddp options on the environment hash as [chimp.ddpX] if multiple provided', function () {
      const myOptions = {
        ddp: ['http://host:port1', 'http://host:port2']
      };

      const chimp = new Chimp(myOptions);

      expect(process.env['chimp.ddp0']).to.equal(myOptions.ddp[0].toString());
      expect(process.env['chimp.ddp1']).to.equal(myOptions.ddp[1].toString());
    });
  });
});
