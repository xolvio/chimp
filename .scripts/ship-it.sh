#!/usr/bin/env bash
set -e

echo Publishing to NPM
npm publish

echo Publishing to Meteor
meteor publish
