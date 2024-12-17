# Climonad.js

> ⚠️ This library is in **early development**. APIs may change without notice.

**A lightning-fast, lightweight library for building powerful command-line interfaces in Node.js.**

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
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
import { Cli, Cmd, Bool, Str, Num } from "climonad"

const cli = new Cli({
  name: "my-app",
  description: "A powerful CLI application",
  commands: [
    new Cmd({
      name: "init",
      description: "Initialize the project",
      alias: "i",
      fn: () => console.log("Project initialization started..."),
    }),
    new Cmd({
      name: "build",
      description: "Build the project",
      alias: "b",
      fn: (data) => {
        console.log(`Building... (verbose: ${data.options.verbose}, output: ${data.options.output})`)
      },
    }),
  ],
  options: [
    new Bool({ name: "verbose", alias: "v", description: "Enable verbose output" }),
    new Str({ name: "output", alias: "o", description: "Specify output path" }),
  ],
})

cli.run(process.argv.slice(2))
```

## Performance

> 💡 **Note**: These are preliminary metrics from an **early development version**. Climonad's API and performance are still evolving.

`Climonad` is engineered for speed, and early benchmarks highlight its efficiency. These benchmarks were conducted using **Deno's built-in `bench` tool**, ensuring consistent and reliable results:

| **Operation**           | **Time (avg)** | **Ops/Second** |
| ----------------------- | -------------- | -------------- |
| CLI Initialization      | ~309.4 ns      | 3,232,000      |
| Basic Command Execution | ~244.9 ns      | 4,083,000      |
| Command with Options    | ~271.1 ns      | 3,689,000      |

## Testing Status 🧪

> 🛠️ If you'd like to contribute by expanding test coverage, check out our [Contributing section!](#contributing-)

At this stage (v0.x.x), Climonad includes only a basic test to validate core functionality. Comprehensive tests for edge cases, integration scenarios, and performance are planned in upcoming releases.

## API Reference

### `Cli`

The main class for defining and running CLI applications.

#### Constructor

```typescript
new Cli({
  name: string,
  description: string,
  commands?: Cmd[],
  options?: Option[],
});
```

#### Methods

- `run(args: string[])`: Parse and execute CLI commands.

### `Cmd`

Define commands with a name, description, and execution function.

### Option Types

- `Bool`: Boolean flags (`--verbose`).
- `Str`: String options (`--output path`).
- `Num`: Numeric options (`--buildNumber 42`).

## Contributing 🤝

[We love contributions!](/CONTRIBUTING_GUIDE.md) Here’s how you can help:

1. 🐛 **Report Bugs**: Found a bug? [Open an issue](https://github.com/supitsdu/climonad/issues).
2. 💡 **Suggest Features**: Got an idea? Let us know by opening an issue.
3. 🛠️ **Submit Pull Requests**:
   - Fork the repository
   - Create a feature branch
   - Submit a pull request 🎉

## License

MIT License © 2024
