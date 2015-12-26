var request = require('request'),
    log     = require('./log');

var SessionManager = require('./session-manager.js');
var BsManager = require('./browserstack-manager.js');
var SlManager = require('./saucelabs-manager.js');

/**
 * Wraps creation of different Session Managers depending on host value.
 *
 * @param {Object} options
 * @api public
 */
function SessionManagerFactory (options) {
	if (options.host.indexOf("browserstack") > -1) {
		return new BsManager(options);
	} else if (options.host.indexOf("saucelabs") > -1) {
		return new SlManager(options);
	} else {
		return new SessionManager(options);
	}
}

module.exports = SessionManagerFactory;