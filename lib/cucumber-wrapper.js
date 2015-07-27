var execOptions = process.argv.slice(1);
execOptions = execOptions.slice(execOptions.indexOf('node'));

var cucumberjs    = require('cucumber'),
    configuration = cucumberjs.Cli.Configuration(execOptions),
    runtime       = cucumberjs.Runtime(configuration);

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
