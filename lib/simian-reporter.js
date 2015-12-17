var request = require('request'),
    log     = require('./log');

/**
 * SimianReporter Constructor
 *
 * @param {Object} options
 * @api public
 */
function SimianReporter (options) {
  this.options = options;

  // FIXME: We need a way to isolate instance in jest tests, until then this allows asserions
  SimianReporter.instance = this;
}

SimianReporter.prototype.report = function (result, callback) {

  var url = require('url').format({
    protocol: 'http',
    host: this.options.simianResultEndPoint,
    query: {
      accessToken: this.options.simianAccessToken
    }
  });

  if (!result.length) {
    console.error('[chimp][simian-reporter]', result);
    callback(result);
    return;
  }

  request.post({
    url: url,
    json: true,
    body: {
      type: 'cucumber',
      result: JSON.parse(Array.prototype.concat.apply([], result).filter(a=>a!=null)[0]),
      branch: this.options.simianResultBranch
    }
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      log.debug('[chimp][simian-reporter]', 'received data', body);
    } else {
      if (body) {
        console.error('[chimp][simian-reporter] Error from Simian:', body.error)
      } else {
        console.error('[chimp][simian-reporter]', 'Error while sending result to Simian:', error);
      }
    }
    callback(error);
  });

};

module.exports = SimianReporter;
