/*
 * This file does some minor modifications on how Cucumber is started.
 *
 * Modifications to the original code from cucumber:
 * - Adds the IPC listener
 * - Modify the argv that are passed to the Cucumber CLI
 * - Use exit instead of process.exit
 */

var Cucumber = require('cucumber');
var exit = require('exit');

// This is a modified version of cucumber/lib/cli
function Cli(argv) {
  var Cucumber = require('cucumber');
  var Command = require('commander').Command;
  var path = require('path');

  function collect(val, memo) {
    memo.push(val);
    return memo;
  }

  function getProgram() {
    var program = new Command(path.basename(argv[1]));

    program
      .usage('[options] [<DIR|FILE[:LINE]>...]')
      .version(Cucumber.VERSION, '-v, --version')
      .option('-b, --backtrace', 'show full backtrace for errors')
      .option('--compiler <EXTENSION:MODULE>', 'require files with the given EXTENSION after requiring MODULE (repeatable)', collect, [])
      .option('-d, --dry-run', 'invoke formatters without executing steps')
      .option('--fail-fast', 'abort the run on first failure')
      .option('-f, --format <TYPE[:PATH]>', 'specify the output format, optionally supply PATH to redirect formatter output (repeatable)', collect, ['pretty'])
      .option('--name <REGEXP>', 'only execute the scenarios with name matching the expression (repeatable)', collect, [])
      .option('--no-colors', 'disable colors in formatter output')
      .option('--no-snippets', 'hide step definition snippets for pending steps')
      .option('--no-source', 'hide source uris')
      .option('-p, --profile <NAME>', 'specify the profile to use (repeatable)', collect, [])
      .option('-r, --require <FILE|DIR>', 'require files before executing features (repeatable)', collect, [])
      .option('--snippet-syntax <FILE>', 'specify a custom snippet syntax')
      .option('-S, --strict', 'fail if there are any undefined or pending steps')
      .option('-t, --tags <EXPRESSION>', 'only execute the features or scenarios with tags matching the expression (repeatable)', collect, []);

    program.on('--help', function () {
      console.log('  For more details please visit https://github.com/cucumber/cucumber-js#cli\n');
    });

    return program;
  }

  function getConfiguration() {
    var program = getProgram();
    program.parse(argv);
    var profileArgs = Cucumber.Cli.ProfilesLoader.getArgs(program.profile);
    if (profileArgs.length > 0) {
      var fullArgs = argv.slice(0, 2).concat(profileArgs).concat(argv.slice(2));
      program = getProgram();
      program.parse(fullArgs);
    }
    var configuration = Cucumber.Cli.Configuration(program.opts(), program.args);
    return configuration;
  }

  var self = {
    run: function run(callback) {
      var configuration = getConfiguration();
      var runtime = Cucumber.Runtime(configuration);
      var formatters = [createIpcFormatter()].concat(configuration.getFormatters());
      formatters.forEach(function (formatter) {
        runtime.attachListener(formatter);
      });
      runtime.start(callback);
    }
  };
  return self;
}

function createIpcFormatter() {
  // add a json formatter that sends results over IPC
  const ipcFormatter = new Cucumber.Listener.JsonFormatter();
  const finish = ipcFormatter.finish;
  ipcFormatter.finish = function sendResultToChimp(callback) {
    finish.call(this, (error, result) => {
      const results = this.getLogs();
      process.send(results);
      callback(error, result);
    });
  };
  return ipcFormatter;
}


// This is a modified version of cucumber/bin/cucumber
var argv = process.argv.slice(1);
argv = argv.slice(argv.indexOf('node'));
var cli = Cli(argv);
cli.run(function (succeeded) {
  var code = succeeded ? 0 : 2;

  function exitNow() {
    exit(code);
  }

  if (process.stdout.write('')) {
    exitNow();
  } else {
    // write() returned false, kernel buffer is not empty yet...
    process.stdout.on('drain', exitNow);
  }
});
