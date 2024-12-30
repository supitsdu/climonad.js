# Climonad.js

> [!WARNING]
> This library is in **early development**, and APIs may change without notice.

**Next-Gen CLI framework built for Node.js.**

## Usage

```javascript
import { Cli } from "climonad"

// Create a new command-line interface
const cli = Cli.createCli({
  name: "pm",
  description: "Project management CLI",
  commands: [Cli.cmd({ name: "init", description: "Initialize the project" })],
  flags: [
    Cli.bool({
      name: "verboseOption",
      flag: "--verbose",
      description: "Enable verbose output",
    }),
  ],
})

try {
  const cliArgs = cli.parse(process.argv.slice(2))
  const help = cliArgs.generateHelp()

  if (help) {
    console.log(JSON.stringify(help, null, 2))
  }

  if (cliArgs.commands.has("init")) {
    // Handle the init command
  }
} catch (err) {
  console.error(error)
}
```

## Argument Parsing and Handling

Climonad uses declarative configuration to define and parse CLI arguments:

### Commands

Commands represent distinct functionalities, like "build" or "serve." Define them using `Cli.cmd()` and assign descriptions, aliases, and flags. For example:

```javascript
Cli.cmd({ name: "serve", description: "Start the development server", alias: "s" })
```

Invoke commands using their name or alias:

```bash
my-app serve
my-app s
```

### Flags

Flags modify command behavior and can be defined as:

- **Boolean Flags**: Toggle features on or off.
- **String Flags**: Accept string values.
- **Number Flags**: Accept numeric inputs.
- **Required Flags**: Mark flags as required, enforcing their presence.
- **Default Values**: Provide fallback values when flags are not specified.

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
Cli.str({
  name: "config",
  flag: "--config",
  description: "Configuration file",
  required: true, // Marking the option as required
})
```

Pass flags as:

```bash
my-app serve --host localhost --port 8080 --verbose
my-app serve --config app.config
```

If the required flag is missing, climonad will throw an error.

### Parsing Logic

- **Positional Arguments**: Commands are identified by position (e.g., `my-app serve`).
- **Flag Arguments**: Flags prefixed with `--` or aliases like `-v` are parsed.
- **Default Values**: If a flag is not provided, Climonad uses the default value.

Example:

```javascript
const result = cli.parse(["serve", "--host", "example.com", "--port", "3000"])
```

Produces:

```javascript
{
  commands: Set(1) { "serve" },
  flags: Map(2) {
    "host": "example.com",
    "port": 3000,
  },
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

- Invalid commands or flags throws a `CliError`.
- Missing required flags will result in an error.
- Invalid values for typed flags (e.g., `--port not-a-number`) raise descriptive errors.

## Performance

> [!NOTE]
> Metrics are preliminary and subject to change as the library evolves.

Benchmarks conducted using **Deno's [`bench`](https://docs.deno.com/api/deno/~/Deno.bench)**:

| **Operation**           | **Time (avg)** | **Ops/Second** |
| ----------------------- | -------------- | -------------- |
| CLI Initialization      | ~725.4 ns      | 1,379,000      |
| Basic Command Execution | ~190.5 ns      | 5,249,000      |
| Command with flags      | ~654.5 ns      | 1,528,000      |

### Algorithmic Complexity

- **CLI Initialization**: O(n) for commands and flags.
- **Command/Option Lookup**: O(1) with optimized caching.
- **Argument Parsing**: O(n) for input arguments.
- **Help Generation**: O(m) for scoped commands/flags.
- **Space Complexity**: O(n) with minimal overhead.

Efficient for small scripts and large CLI applications alike.

## Contributing

We welcome [contributions](/CONTRIBUTING.md)! Here's how you can help:

1. **Report Bugs**: Found a bug? [Open an issue](https://github.com/supitsdu/climonad/issues).
2. **Suggest Features**: Got an idea? Let us know.
3. **Submit Pull Requests**:
   - Fork the repository.
   - Create a feature branch.
   - Submit a pull request.

## License

Licensed under the [MIT License](LICENSE).
