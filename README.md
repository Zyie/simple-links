oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g simple-link
$ sl COMMAND
running command...
$ sl (--version)
simple-link/0.0.0 darwin-arm64 node-v16.19.0
$ sl --help [COMMAND]
USAGE
  $ sl COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`sl hello PERSON`](#sl-hello-person)
* [`sl hello world`](#sl-hello-world)
* [`sl help [COMMAND]`](#sl-help-command)
* [`sl plugins`](#sl-plugins)
* [`sl plugins:install PLUGIN...`](#sl-pluginsinstall-plugin)
* [`sl plugins:inspect PLUGIN...`](#sl-pluginsinspect-plugin)
* [`sl plugins:install PLUGIN...`](#sl-pluginsinstall-plugin-1)
* [`sl plugins:link PLUGIN`](#sl-pluginslink-plugin)
* [`sl plugins:uninstall PLUGIN...`](#sl-pluginsuninstall-plugin)
* [`sl plugins:uninstall PLUGIN...`](#sl-pluginsuninstall-plugin-1)
* [`sl plugins:uninstall PLUGIN...`](#sl-pluginsuninstall-plugin-2)
* [`sl plugins update`](#sl-plugins-update)

## `sl hello PERSON`

Say hello

```
USAGE
  $ sl hello [PERSON] -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/Zyie/simple-link/blob/v0.0.0/dist/commands/hello/index.ts)_

## `sl hello world`

Say hello world

```
USAGE
  $ sl hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ sl hello world
  hello world! (./src/commands/hello/world.ts)
```

## `sl help [COMMAND]`

Display help for sl.

```
USAGE
  $ sl help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for sl.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.22/src/commands/help.ts)_

## `sl plugins`

List installed plugins.

```
USAGE
  $ sl plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ sl plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.12/src/commands/plugins/index.ts)_

## `sl plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ sl plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ sl plugins add

EXAMPLES
  $ sl plugins:install myplugin 

  $ sl plugins:install https://github.com/someuser/someplugin

  $ sl plugins:install someuser/someplugin
```

## `sl plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ sl plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ sl plugins:inspect myplugin
```

## `sl plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ sl plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ sl plugins add

EXAMPLES
  $ sl plugins:install myplugin 

  $ sl plugins:install https://github.com/someuser/someplugin

  $ sl plugins:install someuser/someplugin
```

## `sl plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ sl plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ sl plugins:link myplugin
```

## `sl plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ sl plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ sl plugins unlink
  $ sl plugins remove
```

## `sl plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ sl plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ sl plugins unlink
  $ sl plugins remove
```

## `sl plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ sl plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ sl plugins unlink
  $ sl plugins remove
```

## `sl plugins update`

Update installed plugins.

```
USAGE
  $ sl plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
