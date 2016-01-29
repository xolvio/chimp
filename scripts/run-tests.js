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

run(0, 'Running Chimp Unit tests', './node_modules/.bin/jest');
run(1, 'Running Chimp specs in Chrome', './dist/bin/chimp.js --tags=~@cli');
run(2, 'Running Chimp specs in Firefox', './dist/bin/chimp.js --browser=firefox --tags=~@cli');
run(3, 'Running Chimp specs in Phantom', './dist/bin/chimp.js --browser=phantomjs --tags=~@cli');
