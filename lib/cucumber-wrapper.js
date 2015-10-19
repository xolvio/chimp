var execOptions = process.argv.slice(1);
execOptions = execOptions.slice(execOptions.indexOf('node'));

var _ = require('underscore');
var Fiber = require('fibers');
var Future = require('fibers/future');
var cucumberjs = require('cucumber');
var exit = require('exit');
var configuration = cucumberjs.Cli.Configuration(execOptions);
patchHelpers(cucumberjs, execOptions, configuration);
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
    exit(pass ? 0 : 2);
  });
} catch (e) {
  if (!_handleError(e)) {
    throw(e);
  }
}

var currentStepCallback = null;

global.pending = function (reason) {
  if (currentStepCallback) {
    currentStepCallback.pending(reason);
  }
};

global.fail = function (reason) {
  if (currentStepCallback) {
    currentStepCallback.fail(reason);
  }
};

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
  _.keys(helper).forEach(function (helperName) {
    if (!_.isFunction(helper[helperName]) || helper[helperName]._patched) {
      return;
    }
    helper['_' + helperName] = helper[helperName];
    helper[helperName] = function () {
      // DO NOT REMOVE THE COMMENT BELOW - IT'S USED TO IDENTIFY USER-DEFINED WORLDS. SEE WORLD.JS
      // - - XOLVIO RAW WORLD - -
      if (arguments.length) {
        var lastArgumentIndex = arguments.length - 1;
        var stepDefinition = arguments[lastArgumentIndex];
        // 10 parameters, to make sure that Cucumber never thinks that this is a synchronous step definition
        arguments[lastArgumentIndex] = function (a, b, c, d, e, f, g, h, i, j) {
          var context = this;
          var args = _.toArray(arguments);
          var callback = args.pop();
          var isPending = false;
          var isFail = false;
          if (!(typeof callback === 'function')) {
            throw new Error('Cucumber has not passed a callback to the step definition.');
          }
          var future = new Future();
          Fiber(function () {
            var resolver = _.once(future.resolver());
            resolver.pending = function (reason) {
              isPending = true;
              callback.pending(reason);
              resolver();
            };
            resolver.fail = function (reason) {
              isFail = true;
              callback.fail(reason);
              resolver();
            };
            currentStepCallback = resolver;
            try {
              // Support for callback
              var hasCallback = stepDefinition.length > args.length;
              if (hasCallback) {
                args.push(resolver);
              }

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
                if (!hasCallback) {
                  resolver(null);
                }
              }
            } catch (error) {
              resolver(error);
            }
          }).run();

          future.resolve(function () {
            if (!(isPending || isFail)) {
              callback.apply(this, arguments);
            }
            currentStepCallback = null;
          });
        };
      }

      helper['_' + helperName].apply(this, arguments);
    };

    helper[helperName]._patched = true;
  });
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
