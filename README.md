chimp
=====

Your development companion for doing quality, faster. For a full documentation please go to [chimpjs.com](https://www.chimpjs.com/).

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/chimp.svg)](https://npmjs.org/package/chimp)
[![Downloads/week](https://img.shields.io/npm/dw/chimp.svg)](https://npmjs.org/package/chimp)
[![License](https://img.shields.io/npm/l/chimp.svg)](https://github.com/xolvio/chimp2/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g chimp
$ chimp COMMAND
running command...
$ chimp (-v|--version|version)
chimp/0.0.0-development darwin-x64 node-v12.16.2
$ chimp --help [COMMAND]
USAGE
  $ chimp COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`chimp create [NAME]`](#chimp-create-name)
* [`chimp generate`](#chimp-generate)
* [`chimp help [COMMAND]`](#chimp-help-command)
* [`chimp init`](#chimp-init)

## `chimp create [NAME]`

create (scaffold) a new app

```
USAGE
  $ chimp create [NAME]

ARGUMENTS
  NAME  name of the new app, also used as the directory

OPTIONS
  -a, --appPrefix=appPrefix              [default: ~app] prefix that points to the sourcecode of your app
  -g, --generatedPrefix=generatedPrefix  [default: ~generated] prefix that points to the generated by chimp helper code
  -h, --help                             show CLI help

EXAMPLES
  $ chimp create my-new-app
  $ chimp create my-new-app -a ~src -g ~chimp-helpers
```

_See code: [src/commands/create.ts](https://github.com/xolvio/chimp/blob/v0.0.0-development/src/commands/create.ts)_

## `chimp generate`

generate GraphQL code

```
USAGE
  $ chimp generate

OPTIONS
  -a, --appPrefix=appPrefix              [default: ~app] prefix that points to the sourcecode of your app
  -g, --generatedPrefix=generatedPrefix  [default: ~generated] prefix that points to the generated by chimp helper code
  -h, --help                             show CLI help

  -p, --modulesPath=modulesPath          path to the graphQL modules, only use if you are migrating an existing Apollo
                                         App and you want to use chimp only for a part of it

EXAMPLES
  $ chimp generate
  $ chimp generate -a ~src -g ~chimp-helpers
```

_See code: [src/commands/generate.ts](https://github.com/xolvio/chimp/blob/v0.0.0-development/src/commands/generate.ts)_

## `chimp help [COMMAND]`

display help for chimp

```
USAGE
  $ chimp help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.1/src/commands/help.ts)_

## `chimp init`

init Chimp

```
USAGE
  $ chimp init

OPTIONS
  -h, --help                     show CLI help
  -p, --modulesPath=modulesPath  [default: ./src/modules] path to the GraphQL modules.

EXAMPLES
  $ chimp init
  $ chimp init -p ./src/chimp-modules
```

_See code: [src/commands/init.ts](https://github.com/xolvio/chimp/blob/v0.0.0-development/src/commands/init.ts)_
<!-- commandsstop -->

## Updating jest.config.js after chimp init

Please manually add pathsToModuleNameMapper like so:

```javascript
const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig");
// ...
module.exports = {
  // ...,
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/"
  })
}
```
