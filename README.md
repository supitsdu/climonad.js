# Climonad.js

> [!WARNING]
> This library is in **early development**, and APIs may change without notice.

**A high-performance, low-overhead library for building modern command-line interfaces in Node.js.**

## Features

- **High-Performance**: Lightning-fast CLI argument parsing
- **Flexible**: Easy-to-define commands and options
- **Extensible**: Lightweight, modular architecture with a simple API
- **Powerful**: Support for aliases, flags, and custom options

## Quick Start

### Define Your CLI

```javascript
import { Cli } from "climonad"

const cli = Cli.createCli({
  name: "my-app",
  description: "A powerful CLI application",
  commands: [
    Cli.cmd({ name: "init", description: "Initialize the project" }),
    Cli.cmd({
      name: "build",
      description: "Build the project",
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
  options: [
    Cli.bool({
      name: "verboseOption",
      flag: "--verbose",
      description: "Enable verbose output",
    }),
  ],
})

cli.run(process.argv.slice(2))
```

## Argument Parsing and Handling

Climonad uses declarative configuration to define and parse CLI arguments:

### Commands

Commands represent distinct functionalities, like "build" or "serve." Define them using `Cli.cmd()` and assign descriptions, aliases, and options. For example:

```javascript
Cli.cmd({ name: "serve", description: "Start the development server", alias: "s" })
```

Invoke commands using their name or alias:

```bash
my-app serve
my-app s
```

### Options

Options modify command behavior and can be defined as:

- **Boolean Flags**: Toggle features on or off.
- **String Options**: Accept string values.
- **Number Options**: Accept numeric inputs.
- **Default Values**: Provide fallback values when options are not specified.

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

Pass options as:

```bash
my-app serve --host localhost --port 8080 --verbose
```

### Parsing Logic

- **Positional Arguments**: Commands are identified by position (e.g., `my-app serve`).
- **Flag Arguments**: Options prefixed with `--` or aliases like `-v` are parsed.
- **Default Values**: If a flag is not provided, Climonad uses the default value.

Example:

```javascript
const result = cli.parse(["serve", "--host", "example.com", "--port", "3000"])
```

Produces:

```javascript
{
  commands: new Set(["serve"]),
  options: new Map([
    ["host", "example.com"],
    ["port", 3000],
  ]),
  generateHelp: [Function],
}
```

### Auto Help Generation

Invoke `-h` or `--help` to display detailed help:

- **Global Help**: Provides help for the entire CLI.
- **Command-Scoped Help**: Displays help specific to a command.

Example:

```bash
my-app --help
my-app serve --help
```

### Error Handling

Climonad includes robust error handling:

- Missing required commands or options throws a `CliError`.
- Invalid values for typed options (e.g., `--port not-a-number`) raise descriptive errors.

## Performance

> **Note:** Metrics are preliminary and subject to change as the library evolves.

Benchmarks conducted using **Deno's [`bench`](https://docs.deno.com/api/deno/~/Deno.bench)**:

| **Operation**           | **Time (avg)** | **Ops/Second** |
| ----------------------- | -------------- | -------------- |
| CLI Initialization      | ~725.4 ns      | 1,379,000      |
| Basic Command Execution | ~190.5 ns      | 5,249,000      |
| Command with Options    | ~654.5 ns      | 1,528,000      |

### Algorithmic Complexity

- **CLI Initialization**: O(n) for commands and options.
- **Command/Option Lookup**: O(1) with optimized caching.
- **Argument Parsing**: O(n) for input arguments.
- **Help Generation**: O(m) for scoped commands/options.
- **Space Complexity**: O(n) with minimal overhead.

Efficient for small scripts and large CLI applications alike.

## Contributing

We welcome contributions! Here's how you can help:

1. **Report Bugs**: Found a bug? [Open an issue](https://github.com/supitsdu/climonad/issues).
2. **Suggest Features**: Got an idea? Let us know.
3. **Submit Pull Requests**:
   - Fork the repository.
   - Create a feature branch.
   - Submit a pull request.

## License

Licensed under the [MIT License](LICENSE).
