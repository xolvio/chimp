var myStepDefinitionsWrapper = function () {

  var fs    = require('fs-extra'),
      path  = require('path'),
      spawn = require('child_process').spawn;

  var TMP_DIR = 'tmp';

  var stdOutMessages = [],
      stdErrMessages = [];

  this.Given(/^I deleted the folder called "([^"]*)"$/, function (folder, callback) {
    fs.remove(_getTempLocation(folder), callback);
  });


  this.Given(/^I created a folder called "([^"]*)"$/, function (folder, callback) {
    fs.mkdirs(_getTempLocation(folder), callback);
  });


  this.Given(/^I created a file called "([^"]*)" with$/, function (file, text, callback) {
    fs.outputFile(_getTempLocation(file), text, callback);
  });

  this.When(/^I run chimp inside "([^"]*)"$/, function (directory, callback) {

    var proc = spawn(path.join(process.env.PWD, 'bin/chimp'), [], {
      cwd: _getTempLocation(directory),
      stdio: null
    });

    proc.stdout.on('data', function (data) {
      //process.stdout.write(data);
      stdOutMessages.push(data.toString());
    });

    proc.stderr.on('data', function (data) {
      //process.stderr.write(data);
      stdErrMessages.push(data.toString());
    });

    proc.on('exit', function (code, signal) {
      if (code !== 0) {
        callback.fail('Exit code was ' + code);
      } else {
        callback();
      }

    });

  });

  var context = this;
  this.When(/^I run chimp inside "([^"]*)" in watch mode$/, function (directory, callback) {

    var proc = spawn(path.join(process.env.PWD, 'bin/chimp'), ['--watch'], {
      cwd: _getTempLocation(directory),
      stdio: null,
      detached: true
    });
    context.watchModeProc = proc;

    proc.stdout.on('data', function onData (data) {
      stdOutMessages.push(data.toString());

      // wait test run to finish, since "x steps" is the last log message
      if (data.toString().trim().match(/\d+ steps/)) {
        proc.stdout.removeListener('data', onData);
        proc.kill('SIGINT');
        callback();
      }

    });

  });


  this.When(/^I wait for the chimp to finish rerunning$/, function (callback) {

    context.watchModeProc.stdout.on('data', function onData (data) {

      stdOutMessages.push(data.toString());

      // wait test run to finish, since "x steps" is the last log message
      if (data.toString().trim().match(/\d+ steps/)) {
        context.watchModeProc.stdout.removeListener('data', onData);
        callback();
      }

    });

  });

  this.Then(/^I see "([^"]*)" in the console$/, function (message, callback) {

    // remove all the colors from the stdOutMessages
    var colorsRegex = /\[\d+m|[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g;
    var completeLog = _replaceAll(stdOutMessages.join('\n'), colorsRegex, '');

    if (completeLog.indexOf(message) !== -1) {
      callback();
    } else {
      callback.fail(message + ' was not seen in the console log');
    }

  });

  function _replaceAll (str, find, replace) {
    return str.replace(find, replace);
  }

  function _getTempLocation (location) {
    return path.join(process.env.PWD, TMP_DIR, location);
  }

};
module.exports = myStepDefinitionsWrapper;
