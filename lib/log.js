var log = require('loglevel');

var debugLevel = process.argv.debug || process.env.DEBUG;
if (debugLevel) {
  if (typeof debugLevel === 'boolean') {
    log.setLevel('debug');
  } else {
    log.setLevel(debugLevel);
  }
} else {
  log.setLevel('info');
}

module.exports = log;