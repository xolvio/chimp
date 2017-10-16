const STARTUP_MESSAGE = 5;
const STARTUP_MESSAGE_TIMEOUT = 6;
const startupMessage = process.argv[STARTUP_MESSAGE];
const startupMessageTimeout = parseInt(process.argv[STARTUP_MESSAGE_TIMEOUT]);

const child = require('child_process').fork(
  require('path').join(__dirname, 'starter.js'), process.argv, {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    env: process.env,
    detached: true
  });

child.stdout.on('data', function (data) {
  if (data.toString().match(startupMessage)) {
    process.exit(0);
  }
});

child.stderr.on('data', function (data) {
  console.error('[Chimp.Forker]', data.toString());
  process.exit(1);
});

setTimeout(() => {
  console.error('[Chimp.Forker]', `Startup Message "${startupMessage}" was not see in ${startupMessageTimeout}ms. Exiting...`);
  process.exit(2);
}, startupMessageTimeout);