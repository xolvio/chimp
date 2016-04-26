'use strict';

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * SimianReporter Constructor
 *
 * @param {Object} options
 * @api public
 */
function SimianReporter(options) {
  this.options = options;

  // FIXME: We need a way to isolate instance in jest tests, until then this allows asserions
  SimianReporter.instance = this;
}

SimianReporter.prototype.report = function report(jsonCucumberResult, callback) {
  var query = {
    accessToken: this.options.simianAccessToken
  };
  if (this.options.simianRepositoryId) {
    query.repositoryId = this.options.simianRepositoryId;
  }
  var url = require('url').format({
    protocol: 'http',
    host: this.options.simianResultEndPoint,
    query: query
  });

  var data = {
    type: 'cucumber',
    branch: this.options.simianResultBranch,
    result: jsonCucumberResult
  };
  if (this.options.simianBuildNumber) {
    data.buildNumber = parseInt(this.options.simianBuildNumber, 10);
  }

  _request2.default.post({
    url: url,
    json: true,
    body: data
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      _log2.default.debug('[chimp][simian-reporter]', 'received data', body);
    } else {
      if (body) {
        _log2.default.error('[chimp][simian-reporter] Error from Simian:', body.error);
      } else {
        _log2.default.error('[chimp][simian-reporter]', 'Error while sending result to Simian:', error);
      }
    }
    callback(error);
  });
};

module.exports = SimianReporter;