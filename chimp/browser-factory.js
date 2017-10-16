import path from 'path';

export default class BrowserFactory {
  constructor({
                chromedriver = require('chromedriver'),
                webdriverio = require('webdriverio'),
                childProcess = require('child_process')
              }) {
    this.chromedriver = chromedriver;
    this.webdriverio = webdriverio;
    this.childProcess = childProcess;
  }

  create({port, host, desiredCapabilities, webdriverHubImpl = 'chromedriver'}) {
    this.port = port;
    this.host = host;
    this.desiredCapabilities = desiredCapabilities;
    this.webdriverHubImpl = webdriverHubImpl;

    this._maybeStartWebdriverHub();
    return this._startBrowser();
  }

  _maybeStartWebdriverHub() {
    if (!global[`__webdriverHub${this.port}`]) {
      const proc = this._startWebdriverHub();
      if (proc.status !== 0) {
        throw new Error(`[Chimp.BrowserFactory] Could not start ${this.webdriverHubImpl}`)
      }
      global[`__webdriverHub${this.port}`] = proc;
    }
  }

  _startWebdriverHub() {
    if (this.webdriverHubImpl === 'chromedriver') {
      return this._startChromeDriver();
    }
    if (this.webdriverHubImpl === 'selenium') {
      return this._startSelenium();
    }
    throw new Error(`Webdriver Hub Impl ${this.webdriverHubImpl} is not supported`);
  }

  _startChromeDriver() {
    return this._startLongRunningProcess({
      executablePath: this.chromedriver.path,
      executableArgs: ['--url-base=wd/hub', `--port=${this.port}`],
      waitForMessage: 'Only local connections are allowed.',
      waitForTimeout: 5000
    });
  }

  _startSelenium() {
    throw new Error('Not implemented');
  }

  _startLongRunningProcess({executablePath, executableArgs, waitForMessage, waitForTimeout}) {
    return this.childProcess.spawnSync(process.argv[0], [
      path.join(__dirname, 'utils', 'forker.js'),
      executablePath,
      JSON.stringify(executableArgs),
      process.pid,
      waitForMessage,
      waitForTimeout
    ], {stdio: 'inherit'});
  }

  _startBrowser() {
    return this.webdriverio.remote({
      host: this.host,
      port: this.port,
      desiredCapabilities: this.desiredCapabilities
    });
  }
}
