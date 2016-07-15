jest.dontMock('../lib/simian-reporter');

describe('Simian reporter', function () {

  it('sends the results to Simian and adds the access token', function () {

    var request = require('request');

    var SimianReporter = require('../lib/simian-reporter');
    var simianReporter = new SimianReporter({
      simianResultEndPoint: 'api.simian.io/v1.0/result',
      simianAccessToken: 'secretToken'
    });

    var callback = jest.genMockFunction();
    var result = [{id: 'Use-browser-inside-steps'}];
    simianReporter.report(result, callback);

    expect(request.post.mock.calls.length).toBe(1);

    var postedObject = request.post.mock.calls[0][0];

    expect(postedObject.url).toEqual('http://api.simian.io/v1.0/result?accessToken=secretToken');
    expect(postedObject.json).toEqual(true);
    expect(postedObject.body).toEqual({
      type: 'cucumber',
      result: result
    });


    // calls back on a good response
    var postCallback = request.post.mock.calls[0][1];
    postCallback(null, {statusCode: 200});
    expect(callback.mock.calls.length).toBe(1);

  });

  it('shows the error to the user when Simian returns a non 200 response', function () {

    var request = require('request');

    var SimianReporter = require('../lib/simian-reporter');
    var simianReporter = new SimianReporter({
      simianAccessToken: 'secretToken'
    });

    const log = require('../lib/log');
    spyOn(log, 'error');

    var callback = jest.genMockFunction();
    var result = [{id: 'Use-browser-inside-steps'}];
    simianReporter.report(result, callback);


    // calls back on a good response
    var postCallback = request.post.mock.calls[0][1];
    var response = {
      statusCode: 401
    };
    var body = {
      status: 'error',
      error: 'invalid accessToken'
    };
    postCallback(null, response, body);
    expect(callback.mock.calls.length).toBe(1);
    expect(log.error).toHaveBeenCalledWith('[chimp][simian-reporter] Error from Simian:', 'invalid accessToken');
  });

  it('shows the error to the user when a request error happens before reaching the Simian API', function () {

    var request = require('request');

    var SimianReporter = require('../lib/simian-reporter');
    var simianReporter = new SimianReporter({
      simianAccessToken: 'secretToken'
    });

    const log = require('../lib/log');
    spyOn(log, 'error');

    var callback = jest.genMockFunction();
    var result = [{id: 'Use-browser-inside-steps'}];
    simianReporter.report(result, callback);


    // calls back on a good response
    var postCallback = request.post.mock.calls[0][1];
    var error = new Error('network error');
    var response = null;
    var body = null;
    postCallback(error, response, body);
    expect(callback.mock.calls.length).toBe(1);
    expect(log.error).toHaveBeenCalledWith(
      '[chimp][simian-reporter]', 'Error while sending result to Simian:', error
    );
  });

});

