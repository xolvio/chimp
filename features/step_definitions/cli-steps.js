var myStepDefinitionsWrapper = function () {

  var fs = require('fs-extra'),
      path = require('path'),
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

  this.When(/^I run cuke-monkey inside "([^"]*)"$/, function (directory, callback) {

    var proc = spawn(path.join(process.env.PWD, 'bin/cuke-monkey'), [], {
      cwd: _getTempLocation(directory),
      stdio: null
    });

    proc.stdout.on('data', function (data) {
      stdOutMessages.push(data.toString());
    });

    proc.stderr.on('data', function (data) {
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

  this.Then(/^I see "([^"]*)" in the console$/, function (message, callback) {
    if (stdOutMessages.join().indexOf(message) !== -1) {
      callback();
    } else {
      callback.fail(message + ' was not seen in the console log');
    }


  });


  function _getTempLocation(location) {
    return path.join(process.env.PWD, TMP_DIR, location);
  }

};
module.exports = myStepDefinitionsWrapper;