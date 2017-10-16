describe('BrowserFactory', function () {
  beforeEach(function () {
    td.reset();
    this.chromedriver = {};
    this.webdriverio = {remote: td.function()};
    this.childProcess = {spawnSync: td.function()};
    const BrowserFactory = require('./browser-factory').default;
    this.browserFactory = new BrowserFactory({
      chromedriver: this.chromedriver,
      webdriverio: this.webdriverio,
      childProcess: this.childProcess,
    });
  });
  describe('create', function () {
    it('should start a webdriver hub', function () {
      this.browserFactory._maybeStartWebdriverHub = td.function();
      this.browserFactory._startBrowser = td.function();

      this.browserFactory.create({
        port: 1234,
        host: '1.2.3.4',
        desiredCapabilities: {'some': 'capability'},
        webdriverHubImpl: 'some-driver'
      });

      td.verify(this.browserFactory._maybeStartWebdriverHub());
    });
    it('should return a browser', function () {
      this.browserFactory._maybeStartWebdriverHub = td.function();
      this.browserFactory._startBrowser = td.function();
      const expectedBrowser = "chromeio";
      td.when(this.browserFactory._startBrowser()).thenReturn(expectedBrowser);

      const actualBrowser = this.browserFactory.create({
        port: 1234,
        host: '1.2.3.4',
        desiredCapabilities: {'some': 'capability'},
        webdriverHubImpl: 'some-driver'
      });

      expect(actualBrowser).to.equal(expectedBrowser);
    });
  });
  describe('_maybeStartWebdriverHub', function () {
    beforeEach(function () {
      this.browserFactory.port = 1234;
      delete global[`__webdriverHub${this.browserFactory.port}`];
      this.browserFactory._startWebdriverHub = td.function();
    });
    it('should start the webdriver hub impl', function () {
      td.when(this.browserFactory._startWebdriverHub()).thenReturn({status: 0});
      this.browserFactory._getWebdriverHubImpl = td.function();

      this.browserFactory._maybeStartWebdriverHub();

      td.verify(this.browserFactory._startWebdriverHub());
    });
    it('should throw an error if it cannot start the webdriver hub impl', function () {
      this.browserFactory.webdriverHubImpl = 'some-driver';
      td.when(this.browserFactory._startWebdriverHub()).thenReturn({status: 1});

      expect(() => {
        this.browserFactory._maybeStartWebdriverHub();
      }).to.throw('[Chimp.BrowserFactory] Could not start some-driver');
    });
    it('should not start a webdriver impl if it has already been started on that port', function () {
      td.when(this.browserFactory._startWebdriverHub()).thenReturn({status: 0});

      this.browserFactory._maybeStartWebdriverHub();
      this.browserFactory._maybeStartWebdriverHub();

      td.verify(this.browserFactory._startWebdriverHub(), {times: 1});
    });
  });
  describe('_startWebdriverHub', function () {
    it('should return chromedriver when the chromedriver option is set', function () {
      this.browserFactory._startChromeDriver = td.function();
      this.browserFactory.webdriverHubImpl = 'chromedriver';

      const webdriverImpl = this.browserFactory._startWebdriverHub();

      td.verify(this.browserFactory._startChromeDriver());
    });
    it('should start selenium when the selenium option is set', function () {
      this.browserFactory._startSelenium = td.function();
      this.browserFactory.webdriverHubImpl = 'selenium';

      const webdriverImpl = this.browserFactory._startWebdriverHub();

      td.verify(this.browserFactory._startSelenium());
    });
    it('should throw an error when the webdriver hub impl is not supported', function () {
      this.browserFactory.webdriverHubImpl = 'wtf';
      expect(() => this.browserFactory._startWebdriverHub()).to.throw('wtf is not supported')
    });
  });
  describe('_startChromeDriver', function () {
    beforeEach(function() {
      this.browserFactory._startLongRunningProcess = td.function();
      this.chromedriver.path = 'chromedriver/path';
      this.browserFactory.port = 1234;
    });
    it('should start a long running process', function () {
      this.browserFactory._startChromeDriver();

      td.verify(this.browserFactory._startLongRunningProcess({
        executablePath: 'chromedriver/path',
        executableArgs: ['--url-base=wd/hub', '--port=1234'],
        waitForMessage: 'Only local connections are allowed.',
        waitForTimeout: 5000
      }));
    });
    it('should return the process', function () {
      td.when(this.browserFactory._startLongRunningProcess(td.matchers.anything())).thenReturn('proc');

      const proc = this.browserFactory._startChromeDriver();

      expect(proc).to.equal('proc');
    });
  });
  describe('_startSelenium', function () {
    it.skip('should ', function () {
      throw('Not implemented');
    });
  });
  describe('_startLongRunningProcess', function () {
    beforeEach(function () {
      this.browserFactory._startLongRunningProcess({
        executablePath: 'some/path',
        executableArgs: ['an', 'arg'],
        waitForMessage: 'A lovely message',
        waitForTimeout: 4567
      });
    });
    it('should spawn a synchronous forker using the same environment node', function () {
      td.verify(this.childProcess.spawnSync(
        process.argv[0], [
          `${__dirname}/utils/forker.js`,
          td.matchers.anything(),
          td.matchers.anything(),
          td.matchers.anything(),
          td.matchers.anything(),
          td.matchers.anything()
        ],
        td.matchers.anything()
      ));
    });
    it('should pass the executable path', function () {
      td.verify(this.childProcess.spawnSync(
        td.matchers.anything(), [
          td.matchers.anything(),
          'some/path',
          td.matchers.anything(),
          td.matchers.anything(),
          td.matchers.anything(),
          td.matchers.anything()
        ],
        td.matchers.anything()
      ));
    });
    it('should stringify the executable args', function () {
      td.verify(this.childProcess.spawnSync(
        td.matchers.anything(), [
          td.matchers.anything(),
          td.matchers.anything(),
          JSON.stringify(['an', 'arg']),
          td.matchers.anything(),
          td.matchers.anything(),
          td.matchers.anything()
        ],
        td.matchers.anything()
      ));
    });
    it('should pass the parent pid', function () {
      td.verify(this.childProcess.spawnSync(
        td.matchers.anything(), [
          td.matchers.anything(),
          td.matchers.anything(),
          td.matchers.anything(),
          process.pid,
          td.matchers.anything(),
          td.matchers.anything()
        ],
        td.matchers.anything()
      ));
    });
    it('should pass the waitFor message and timeout', function () {
      td.verify(this.childProcess.spawnSync(
        td.matchers.anything(), [
          td.matchers.anything(),
          td.matchers.anything(),
          td.matchers.anything(),
          td.matchers.anything(),
          'A lovely message',
          4567
        ],
        td.matchers.anything(),
      ));
    });
    it('should inherit the stdio', function () {
      td.verify(this.childProcess.spawnSync(
        td.matchers.anything(), [
          td.matchers.anything(),
          td.matchers.anything(),
          td.matchers.anything(),
          td.matchers.anything(),
          td.matchers.anything(),
          td.matchers.anything(),
        ],
        {stdio: 'inherit'}
      ));
    });
  });
  describe('_startBrowser', function () {
    it('should create a new remote with the host, port and desired capabilities', function () {
      this.browserFactory.host = '1.2.3.4';
      this.browserFactory.port = 1234;
      this.browserFactory.desiredCapabilities = {'some': 'capability'};

      this.browserFactory._startBrowser();

      td.verify(this.webdriverio.remote({
        host: '1.2.3.4',
        port: 1234,
        desiredCapabilities: {'some': 'capability'}
      }));
    });
  });
});