#!/usr/bin/env bash

set -e

npm run prepublish
./bin/chimp.js "$@"
