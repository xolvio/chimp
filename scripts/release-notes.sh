#!/usr/bin/env bash

# To install:
# npm install -g git-release-notes

git checkout master
./node_modules/.bin/git-release-notes v`npm view . version`..master ./scripts/release-notes.ejs >> ./commits.md
echo "# `npm view . version`" > tempHistory.md
cat ./commits.md >> ./tempHistory.md
cat ./HISTORY.md >> ./tempHistory.md
cat ./tempHistory.md > ./HISTORY2.md
rm ./commits.md
rm ./tempHistory.md
