# Climonad.js

> ⚠️ This library is in **early development**. APIs may change without notice.

**A high-performance, low-overhead library for building modern command-line interfaces in Node.js.**

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Argument Parsing and Handling](#argument-parsing-and-handling)
- [Performance](#performance)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Features

- ⚡ **High-Performance**: Lightning-fast CLI argument parsing
- 🌈 **Flexible**: Easy-to-define commands and options
- 🔧 **Extensible**: Lightweight, modular architecture with a simple API
- 💪 **Powerful**: Support for aliases, flags, and custom options

## Quick Start

### Define Your CLI

```javascript
import { Cli } from "climonad"

const cli = new Cli({
  name: "my-app",
  description: "A powerful CLI application",
  // Global Commands:
  commands: [
    Cli.cmd({
      name: "init",
      description: "Initialize the project",
    }),
    Cli.cmd({
      name: "build",
      description: "Build the project",
      // Command Scoped Options:
      options: [
        Cli.str({
          name: "output",
          flag: "--out",
          alias: "-o",
          description: "Set output directory",
        }),
      ],
    }),
  ],
  // Global Options:
  options: [Cli.bool({ name: "verboseOption", flag: "--verbose", description: "Enable verbose output" })],
})

cli.run(process.argv.slice(2))
```

## Argument Parsing and Handling

Climonad uses a declarative configuration approach to define and parse CLI arguments. Here's how it works:

### Commands

Commands represent distinct actions or functionalities. For example, "build" or "serve". You define commands using `Cli.cmd()` and assign them descriptions, aliases, and options. During runtime, Climonad identifies the invoked command based on the first positional argument:

```javascript
Cli.cmd({
  name: "serve",
  description: "Start the development server",
  alias: "s",
})
```

Users can invoke this command using `serve` or its alias `s`:

```bash
my-app serve
my-app s
```

### Options

Options modify the behavior of commands. They are identified by flags (e.g., `--verbose`) or aliases (e.g., `-v`). Climonad supports different types of options:

- **Boolean Flags**: Toggle features on or off.
- **String Options**: Accept string values.
- **Number Options**: Accept numeric inputs.
- **Default Values**: Provide fallbacks when options are not specified.

Example:

```javascript
Cli.str({
  name: "host",
  flag: "--host",
  description: "Specify the hostname",
  default: "localhost",
})
Cli.num({
  name: "port",
  flag: "--port",
  description: "Set the port number",
})
Cli.bool({
  name: "verbose",
  flag: "--verbose",
  description: "Enable verbose logging",
})
```

Users can pass options as:

```bash
my-app serve --host localhost --port 8080 --verbose
```

### Parsing Logic

- **Positional Arguments**: Climonad identifies commands based on their position. For example, in `my-app serve`, "serve" is a positional argument matched to a command.
- **Flag Arguments**: Options prefixed with `--` (or aliases like `-v`) are parsed and mapped to their respective definitions.
- **Default Values**: If a flag is not provided, Climonad falls back to the default value defined in its configuration.

Example:

```javascript
const result = cli.parse(["serve", "--host", "example.com", "--port", "3000"])
```

Results in:

```js
{
  "commands": Set(1) { "serve" },
  "options": Map(2) { "host" => "example.com", "port" => 3000 },
  "generateHelp": [Function (anonymous)]
}
```

### Auto Help Generation

Climonad provides built-in support for command-scoped help generation. Users can invoke the `-h` or `--help` flag to display detailed help information:

- **Global Help**: When used without a command, it shows help for the entire CLI application.
- **Command-Scoped Help**: When used with a command, it displays help specific to that command.

Example:

```bash
my-app --help
my-app serve --help
```

This feature is automatically enabled, requiring no additional configuration.

### Error Handling

Climonad provides robust error handling for invalid or unknown arguments. For example:

- If a required command or option is missing, it throws a `CliError`.
- If an invalid value is provided for a typed option (e.g., `--port not-a-number`), it raises an appropriate error.

## Performance

> 💡 **Note**: These are preliminary metrics from an **early development version**. Climonad's API and performance are still evolving.

These [`benchmarks`](test/bench.ts) were conducted using **Deno's built-in [`bench`](https://docs.deno.com/api/deno/~/Deno.bench) tool**, ensuring consistent and reliable results:

| **Operation**           | **Time (avg)** | **Ops/Second** |
| ----------------------- | -------------- | -------------- |
| CLI Initialization      | ~725.4 ns      | 1,379,000      |
| Basic Command Execution | ~190.5 ns      | 5,249,000      |
| Command with Options    | ~654.5 ns      | 1,528,000      |

### Algorithmic Complexity (Latest Update)

- **CLI Initialization**: O(n) where n is the total number of commands and options being registered
- **Command/Option Lookup**: O(1) using an optimized tree structure with path caching
- **Argument Parsing**: O(n) where n is the number of input arguments
- **Help Generation**: O(m) where m is the number of commands/options in the current scope
- **Space Complexity**: O(n) where n is the total number of registered commands and options, with a small additional overhead for the path cache which improves lookup performance.

Climonad is now highly efficient for both small scripts and large CLI applications with many commands and options.

## Contributing 🤝

[We love contributions!](/CONTRIBUTING_GUIDE.md) Here’s how you can help:

1. 🐛 **Report Bugs**: Found a bug? [Open an issue](https://github.com/supitsdu/climonad/issues).
2. 💡 **Suggest Features**: Got an idea? Let us know by opening an issue.
3. 🛠️ **Submit Pull Requests**:
   - Fork the repository
   - Create a feature branch
   - Submit a pull request 🎉

## License

Licensed under the [MIT License](LICENSE).
