var execOptions = process.argv.slice(1);
execOptions = execOptions.slice(execOptions.indexOf('node'));

var _ = require('underscore');
var Fiber = require('fibers');
var Future = require('fibers/future');
var cucumberjs = require('cucumber');
var configuration = cucumberjs.Cli.Configuration(execOptions);
patchHelpers(cucumberjs, execOptions, configuration)
var runtime = cucumberjs.Runtime(configuration);

// add a json formatter that sends results over IPC
var formatter = new cucumberjs.Listener.JsonFormatter();
formatter.log = function (results) {
  process.send(results);
};
runtime.attachListener(formatter);

// use original formatter
runtime.attachListener(configuration.getFormatter());

try {
  runtime.start(function (pass) {
    process.exit(pass ? 0 : 2);
  });
} catch (e) {
  if (!_handleError(e)) {
    throw(e);
  }
}

function patchHelpers(cuke, execOptions, configuration) {
  // taken from
  // https://github.com/xdissent/meteor-cucumber/blob/master/src/runner/local.coffee
  var argumentParser = cuke.Cli.ArgumentParser(execOptions);
  argumentParser.parse();
  configuration.getSupportCodeLibrary = function () {
    var supportCodeFilePaths = argumentParser.getSupportCodeFilePaths();
    var supportCodeLoader = cuke.Cli.SupportCodeLoader(supportCodeFilePaths);
    supportCodeLoader._buildSupportCodeInitializerFromPaths = supportCodeLoader.buildSupportCodeInitializerFromPaths;
    supportCodeLoader.buildSupportCodeInitializerFromPaths = function (paths) {
      var wrapper = supportCodeLoader._buildSupportCodeInitializerFromPaths(paths);
      return function () {
        patchHelper(this);
        return wrapper.call(this);
      };
    };
    return supportCodeLoader.getSupportCodeLibrary();
  };
}

function patchHelper(helper) {

  if (!!helper._patched) {
    return;
  }
  helper._patched = true;

  _.keys(helper).forEach(function (step) {
    if (!_.isFunction(helper[step]) || helper[step]._patched) {
      return;
    }

    helper['_' + step] = helper[step];
    helper[step] = function (/* arguments */) {
      var stepDefinitionArgs = arguments;
      if (arguments.length) {
        var lastArgumentIndex = arguments.length - 1;
        var stepDefinition = arguments[lastArgumentIndex];
        // 10 parameters, to make sure that Cucumber never thinks that this is a synchronous step definition
        arguments[lastArgumentIndex] = function (a, b, c, d, e, f, g, h, i, j) {
          var context = this;
          var args = _.toArray(arguments);
          var callback = args.pop();
          if (!(typeof callback === 'function')) {
            throw new Error('Cucumber has not passed a callback to the step definition.');
          }
          var future = new Future();
          Fiber(function () {
            var resolver = _.once(future.resolver());
            try {
              args.push(resolver);
              var result = stepDefinition.apply(context, args);
              // Support for returning promise
              if (result && typeof result.then === 'function') {
                result.then(
                  function (result) {
                    resolver(null, result);
                  },
                  function (error) {
                    resolver(error);
                  }
                );
              } else {
                var hasStepDefinitionCallback = stepDefinition.length > args.length;
                // Support for callback
                if (hasStepDefinitionCallback) {

                } else {
                  resolver(null);
                }
              }
            } catch (error) {
              resolver(error);
            }
          }).run();

          future.resolve(callback);
        };
      }

      helper['_' + step].apply(this, arguments);
    };

    helper[step]._patched = true;
  });

  // Given, When, Then
  helper.Given = helper.When = helper.Then = helper.defineStep;

  // What about these?
  // registerListener
  // registerHandler
  // StepResult

}

function makeFunction(fn, length) {
  switch (length) {
    case 0: return function () { return fn.apply(this, arguments); };
    case 1: return function (a) { return fn.apply(this, arguments); };
    case 2: return function (a,b) { return fn.apply(this, arguments); };
    case 3: return function (a,b,c) { return fn.apply(this, arguments); };
    case 4: return function (a,b,c,d) { return fn.apply(this, arguments); };
    case 5: return function (a,b,c,d,e) { return fn.apply(this, arguments); };
    case 6: return function (a,b,c,d,e,f) { return fn.apply(this, arguments); };
    case 7: return function (a,b,c,d,e,f,g) { return fn.apply(this, arguments); };
    case 8: return function (a,b,c,d,e,f,g,h) { return fn.apply(this, arguments); };
    case 9: return function (a,b,c,d,e,f,g,h,i) { return fn.apply(this, arguments); };
    case 10: return function (a,b,c,d,e,f,g,h,i,j) { return fn.apply(this, arguments); };
    default: throw new Error('Only functions with up to 10 parameters are supported.');
  }
}

function _handleError (e) {

  if (e.message.indexOf('Cannot read property \'convertScenarioOutlinesToScenarios\' of undefined') !== -1) {
    console.error('[chimp][cucumber]', e.message);
    console.error('[chimp][cucumber] Detected a cryptic CucumberJS error. Is the feature file empty?');
    return true;
  }

  if (e.message.indexOf('Cannot read property \'getTags\' of undefined') !== -1) {
    console.error('[chimp][cucumber]', e.message);
    console.error('[chimp][cucumber] Detected a cryptic CucumberJS error. Did you forget the feature line?');
    return true;
  }

}
