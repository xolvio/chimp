const webdriverio = require('webdriverio');
const chromedriver = require('chromedriver');

export default function BrowserFactory({port = 9515, host = '127.0.0.1', desiredCapabilities}) {

  const args = [
    '--url-base=wd/hub',
    `--port=${port}`
  ];

  if (!global[`__chromedriver${port}`]) {
    chromedriver.start(args);
  }
  global[`__chromedriver${port}`] = chromedriver;

  const options = {
    host,
    port,
    desiredCapabilities
  };

  return webdriverio.remote(options);
}

process.on('exit', (code) => {
  chromedriver.stop();
});
