#!/usr/bin/env bash
set -e
npm test

echo Pushing the commits
git push origin master
echo Pushing tags
git push origin master --tags

echo Publishing to NPM
npm publish
