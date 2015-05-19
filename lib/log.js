var log      = require('loglevel'),
    minimist = require('minimist');

var argv = minimist(process.argv, {
    'default': {
      'debug': false,
      'log': 'info'
    }, 'boolean': true
  }) || [];

var debug = process.env['chimp.debug'] === 'true' ? true :
  process.env['chimp.debug'] === 'false' ? false :
  process.env['chimp.debug'] || argv.debug;

if (debug) {
  log.setLevel('debug');
} else {
  log.setLevel(argv.log);
}
module.exports = log;