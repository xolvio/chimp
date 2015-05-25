#!/usr/bin/env bash
set -e
npm test

echo Adding files to git
git add .
echo Committing files to git
git commit -m "$1"

echo Patching npm version
npm version patch

echo Adding files to git again
git add .
echo Committing files to git again
git commit -m "$1"

echo Pushing the commits
git push
echo Pushing tags
git push --tags

echo Publishing to NPM
npm publish