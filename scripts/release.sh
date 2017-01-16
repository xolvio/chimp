#!/usr/bin/env bash
set -e
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

semvar="$1"
case $semvar in
    patch)
    echo patch
    ;;
    minor)
    echo minor
    ;;
    major)
    echo major
    ;;
    prepatch)
    echo prepatch
    ;;
    preminor)
    echo preminor
    ;;
    premajor)
    echo premojor
    ;;
    prerelease)
    echo prerelease
    ;;
    *)
      echo "Usage: release patch|minor|major|prepatch|preminor|premajor|prerelease"
      exit 1
    ;;
esac
currentVersion=`node -e "console.log(require('$scriptDir/../package.json').version)"`

./node_modules/.bin/git-release-notes v$currentVersion..master ./scripts/release-notes.ejs >> ./commits.md

npm version $semvar
npm publish

newVersion=`node -e "console.log(require('$scriptDir/../package.json').version)"`

echo "# $newVersion" > tempHistory.md
cat ./commits.md >> ./tempHistory.md
cat ./HISTORY.md >> ./tempHistory.md
cat ./tempHistory.md > ./HISTORY.md
rm ./commits.md
rm ./tempHistory.md

git add .
git commit -m "Adds the release notes for v$newVersion"
git push
git push --tags
