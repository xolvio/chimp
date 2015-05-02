var execOptions = process.argv.splice(2, process.argv.length);

var cucumberjs    = require('cucumber'),
    configuration = cucumberjs.Cli.Configuration(execOptions),
    runtime       = cucumberjs.Runtime(configuration);

// add a json formatter that sends results over IPC
if (process.env['monkey.ipc']) {
  var formatter = new cucumberjs.Listener.JsonFormatter();
  formatter.log = function (results) {
    process.send(results);
  };
  runtime.attachListener(formatter);
}

// use original formatter
runtime.attachListener(configuration.getFormatter());

runtime.start(function (pass) {
  process.exit(pass ? 0 : 2);
});