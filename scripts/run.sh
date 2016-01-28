#!/usr/bin/env bash

set -e

npm run prepublish
./dist/bin/chimp.js "$@"
