# For NPM Chimp

## ES2015

* We use Babel to compile our ES2015 code to ES5.
* The compiled ES5 code is in the `dist/` folder.
* You can compile the code with `npm run prepublish`.
  This is done automatically before you publish a release.

## Watch

You can run `npm run watch` to use [npm-watch](https://www.npmjs.com/package/npm-watch) to 
run the npm task `prepublish` automatically on change to `src/lib` or `src/bin`.

## Running tests

You can use [Wallaby](http://wallabyjs.com/) if you own it or just run `npm test`.

## Running Chimp

The run script will compile the source code before running Chimp.

```sh
./scripts/run.js <CHIMP_ARGUMENTS>
```

## Release a new version

* Update the documentation
* Bump the version with `npm version <patch|minor|major>`.
  Use the [Semantic versioning](http://semver.org/) conventions for bumping the version.
* Publish the new release with: `npm publish`
