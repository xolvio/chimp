var request = require('request'),
  log = require('./log');

var SessionManager = require('./session-manager.js');
var BsManager = require('./browserstack-manager.js');
var SlManager = require('./saucelabs-manager.js');
var TbManager = require('./testingbot-manager.js');

/**
 * Wraps creation of different Session Managers depending on host value.
 *
 * @param {Object} options
 * @api public
 */
function SessionManagerFactory(options) {

	  log.debug('[chimp][session-manager-factory] options are', options);

	  if (!options) {
		  throw new Error('options is required');
	}

	  if (!options.port) {
		  throw new Error('options.port is required');
	}

	  if (!options.browser && !options.deviceName) {
		  throw new Error('[chimp][session-manager-factory] options.browser or options.deviceName is required');
	}

	  if (options.host && (options.host.indexOf('browserstack') > -1 || options.host.indexOf('saucelabs') > -1 || options.host.indexOf('testingbot') > -1)) {

		  if (!options.user || !options.key) {
			  throw new Error('[chimp][session-manager-factory] options.user and options.key are required');
		}

		  if (options.host.indexOf('browserstack') > -1) {
			  return new BsManager(options);
		} else if (options.host.indexOf('saucelabs') > -1) {
			  return new SlManager(options);
		} else if (options.host.indexOf('testingbot') > -1) {
			  return new TbManager(options);
		}

	} else {
		  return new SessionManager(options);
	}

}

module.exports = SessionManagerFactory;
