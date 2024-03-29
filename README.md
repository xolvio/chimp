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
$ chimp (--version)
chimp/0.0.0-development darwin-arm64 node-v18.1.0
$ chimp --help [COMMAND]
USAGE
  $ chimp COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`chimp create NAME`](#chimp-create-name)
* [`chimp eject`](#chimp-eject)
* [`chimp generate`](#chimp-generate)
* [`chimp help [COMMANDS]`](#chimp-help-commands)
* [`chimp init`](#chimp-init)

## `chimp create NAME`

create (scaffold) a new app

```
USAGE
  $ chimp create NAME [-h] [-a <value>] [-g <value>]

ARGUMENTS
  NAME  name of the new app, also used as the directory

FLAGS
  -a, --appPrefix=<value>        [default: ~app] prefix that points to the sourcecode of your app
  -g, --generatedPrefix=<value>  [default: ~generated] prefix that points to the generated by chimp helper code
  -h, --help                     Show CLI help.

DESCRIPTION
  create (scaffold) a new app

EXAMPLES
  $ chimp create my-new-app

  $ chimp create my-new-app -a ~src -g ~chimp-helpers
```

_See code: [src/commands/create.ts](https://github.com/xolvio/chimp/blob/v0.0.0-development/src/commands/create.ts)_

## `chimp eject`

Eject from chimp. While chimp is not a runtime dependency and your project will still run after removing it, ejecting offers a cleaner development environment. While we hope you never need to eject, it is reassuring to know you have the option. If you choose to eject or are considering it, please inform us. Remember, you are always just one command away from this choice.

```
USAGE
  $ chimp eject [-h]

FLAGS
  -h, --help  Show CLI help.

DESCRIPTION
  Eject from chimp. While chimp is not a runtime dependency and your project will still run after removing it, ejecting
  offers a cleaner development environment. While we hope you never need to eject, it is reassuring to know you have the
  option. If you choose to eject or are considering it, please inform us. Remember, you are always just one command away
  from this choice.

EXAMPLES
  $ chimp eject
```

_See code: [src/commands/eject.ts](https://github.com/xolvio/chimp/blob/v0.0.0-development/src/commands/eject.ts)_

## `chimp generate`

generate GraphQL code

```
USAGE
  $ chimp generate [-h] [-a <value>] [-g <value>] [-p <value>]

FLAGS
  -a, --appPrefix=<value>        [default: ~app] prefix that points to the sourcecode of your app
  -g, --generatedPrefix=<value>  [default: ~generated] prefix that points to the generated by chimp helper code
  -h, --help                     Show CLI help.
  -p, --modulesPath=<value>      path to the graphQL modules, only use if you are migrating an existing Apollo App and
                                 you want to use chimp only for a part of it

DESCRIPTION
  generate GraphQL code

EXAMPLES
  $ chimp generate

  $ chimp generate -a ~src -g ~chimp-helpers
```

_See code: [src/commands/generate.ts](https://github.com/xolvio/chimp/blob/v0.0.0-development/src/commands/generate.ts)_

## `chimp help [COMMANDS]`

Display help for chimp.

```
USAGE
  $ chimp help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for chimp.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.16/src/commands/help.ts)_

## `chimp init`

init Chimp

```
USAGE
  $ chimp init [-h] [-p <value>]

FLAGS
  -h, --help                 Show CLI help.
  -p, --modulesPath=<value>  [default: ./src/modules] path to the GraphQL modules.

DESCRIPTION
  init Chimp

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
