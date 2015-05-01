var log      = require('loglevel'),
    minimist = require('minimist');

var argv = minimist(process.argv, {
    'default': {
      'debug': false,
      'log': 'warn'
    }, 'boolean': true
  }) || [];

var debug = process.env['monkey.debug'] === 'true' ? true :
  process.env['monkey.debug'] === 'false' ? false :
  process.env['monkey.debug'] || argv.debug;

if (debug) {
  log.setLevel('debug');
} else {
  log.setLevel(argv.log);
}
module.exports = log;