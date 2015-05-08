#!/usr/bin/env bash
git add .
git commit -m %1
git tag v%2
git push
git push --tags
npm publish