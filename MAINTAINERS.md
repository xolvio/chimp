# For NPM Chimp

## Running tests

You can use [Wallaby](http://wallabyjs.com/) if you own it or just run `npm test`.

## Release a new version

* Update the documentation
* Bump the version with `npm version <patch|minor|major>`.
  Use the [Semantic versioning](http://semver.org/) conventions for bumping the version.
* Bump the version in package.js  
* Publish the new release with: `.scripts/ship-it.sh`

# For Meteor Chimp

## Running tests

```sh
cd ./meteor/test-app
meteor --test
```

## Release a new version

First `meteor publish`.

Then you need to build the package on all architectures.

```sh
meteor admin get-machine os.osx.x86_64 --minutes 10
meteor admin get-machine os.linux.x86_64 --minutes 10
meteor admin get-machine os.linux.x86_32 --minutes 10
meteor admin get-machine os.windows.x86_32 --minutes 10
```

```sh
meteor publish-for-arch xolvio:cucumber@X.X.X
```
