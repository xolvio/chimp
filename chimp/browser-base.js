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

  //XXX temporary hack to start the debug chromedriver right away, so chimp doesn't time out the first time you try
  // to run it in debug mode.
  // We need to figure out how to wait for the chromedriver to startup before initializing the browser,
  // even though we can't use await/async here. Right now chimp is too fast :-)
  const debugPort = 9516;
  if (!global[`__chromedriver${debugPort}`]) {
    args[1] = `--port=${debugPort}`;
    chromedriver.start(args);
    global[`__chromedriver${debugPort}`] = chromedriver;
  }

  const options = {
    host,
    port,
    desiredCapabilities
  };


  const browser = webdriverio.remote(options);

  const browserEnd = browser.end;
  browser.end = async function() {
    console.log('stopping chrome');
    await browserEnd.apply(this, arguments);
    chromedriver.stop();
  };

  return browser;
}

process.on('exit', (code) => {
  chromedriver.stop();
});
