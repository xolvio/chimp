#!/usr/bin/env bash

set -e

echo Running Unit tests
#jest

echo Running specs in Chrome
#./bin/chimp --tags=~@cli
echo Running specs in Firefox
#./bin/chimp --browser=firefox --tags=~@cli
echo Running specs in Phantom
#./bin/chimp --browser=phantomjs --tags=~@cli

cd meteor/test-app
velocity test-app --ci
