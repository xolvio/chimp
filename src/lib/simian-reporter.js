import request from 'request';
import log from './log';

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
  const query = {
    accessToken: this.options.simianAccessToken,
  };
  if (this.options.simianRepositoryId) {
    query.repositoryId = this.options.simianRepositoryId;
  }
  const url = require('url').format({
    protocol: 'http',
    host: this.options.simianResultEndPoint,
    query,
  });

  const data = {
    type: 'cucumber',
    branch: this.options.simianResultBranch,
    result: jsonCucumberResult,
  };
  if (this.options.simianBuildNumber) {
    data.buildNumber = parseInt(this.options.simianBuildNumber, 10);
  }

  request.post(
    {
      url,
      json: true,
      body: data,
    },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        log.debug('[chimp][simian-reporter]', 'received data', body);
      } else {
        if (body) {
          log.error('[chimp][simian-reporter] Error from Simian:', body.error);
        } else {
          log.error('[chimp][simian-reporter]', 'Error while sending result to Simian:', error);
        }
      }
      callback(error);
    }
  );
};

module.exports = SimianReporter;
