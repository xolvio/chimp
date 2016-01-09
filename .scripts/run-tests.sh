#!/usr/bin/env bash

set -e

echo Running Chimp Unit tests
jest

echo Running Chimp specs in Chrome
./bin/chimp --tags=~@cli
echo Running Chimp specs in Firefox
./bin/chimp --browser=firefox --tags=~@cli
echo Running Chimp specs in Phantom
./bin/chimp --browser=phantomjs --tags=~@cli
