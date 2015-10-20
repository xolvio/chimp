#!/usr/bin/env bash

# To install:
# npm install -g git-release-notes

echo "# vNext" > tempHistory.md
git-release-notes $1..master ./.scripts/release-notes.ejs >> ./tempHistory.md
cat ./HISTORY.md >> ./tempHistory.md
cat ./tempHistory.md > ./HISTORY.md
rm ./tempHistory.md
