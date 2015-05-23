#!/usr/bin/env bash
set -e
npm test
git add .
git commit -m "$1"
npm version patch
git commit -m "$1"
git push
git push --tags
npm publish