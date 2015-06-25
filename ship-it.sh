#!/usr/bin/env bash
set -e
npm test

echo Pushing the commits
git push
echo Pushing tags
git push --tags

echo Publishing to NPM
npm publish
