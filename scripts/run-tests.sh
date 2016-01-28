#!/usr/bin/env bash

set -e

echo Running Chimp Unit tests
jest

echo Running Chimp specs in Chrome
./dist/bin/chimp.js --tags=~@cli
echo Running Chimp specs in Firefox
./dist/bin/chimp.js --browser=firefox --tags=~@cli
echo Running Chimp specs in Phantom
./dist/bin/chimp.js --browser=phantomjs --tags=~@cli
