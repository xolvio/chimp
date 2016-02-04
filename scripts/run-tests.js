#!/usr/bin/env node

require('shelljs/global');

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
  // Prevent exceeding the maximum RAM. Each worker need ~385MB.
  unitTestsCommand += ' --maxWorkers 8';
}
run(0, 'Running Chimp Unit tests', unitTestsCommand);
run(1, 'Running Chimp specs in Chrome', './bin/chimp.js --tags=~@cli');
run(2, 'Running Chimp specs in Firefox', './bin/chimp.js --browser=firefox --tags=~@cli');
run(3, 'Running Chimp specs in Phantom', './bin/chimp.js --browser=phantomjs --tags=~@cli');
