#!/usr/bin/env node

require('shelljs/global');
var exec = require('./lib/exec');

var nodeIndex = parseInt(env.CIRCLE_NODE_INDEX, 10);
var isCI = !isNaN(nodeIndex);

var run = function (runOnNodeIndex, name, command) {
  if (!isCI || nodeIndex === runOnNodeIndex) {
    echo(name);
    if (exec(command).code !== 0) {
      exit(1);
    }
  }
};

var unitTestsCommand = './node_modules/.bin/jest';
if (isCI) {
  // Prevent exceeding the maximum RAM. Each worker needs ~385MB.
  unitTestsCommand += ' --maxWorkers 4';
}
run(0, 'Running Chimp Unit tests', unitTestsCommand);
run(0, 'Running Chimp Mocha specs in Chrome', 'node ./bin/chimp.js --mocha --path=tests/mocha');
run(0, 'Running Chimp Jasmine specs in Chrome', 'node ./bin/chimp.js --jasmine --path=tests/jasmine');

if (isCI) {
run(1, 'Running Chimp Cucumber specs in Chrome', 'node ./bin/chimp.js --tags=~@cli --simianRepositoryId=' + env.SIMIAN_REPOSITORY + ' --simianAccessToken=' + env.SIMIAN_ACCESS_TOKEN);
} else {
  run(1, 'Running Chimp Cucumber specs in Chrome', 'node ./bin/chimp.js --tags=~@cli');
}

run(2, 'Running Chimp Cucumber specs in Firefox', 'node ./bin/chimp.js --browser=firefox --tags=~@cli');
run(3, 'Running Chimp Cucumber specs in Phantom', 'node ./bin/chimp.js --browser=phantomjs --tags=~@cli');
