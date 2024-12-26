# Flags

> Flags empower you to create flexible and customizable CLI commands, allowing users to control application behavior effectively.

---

## Defining Flags

Flags are the building blocks for accepting user input. They can be strings, booleans, or numbers, and are defined using the `Cli.str`, `Cli.bool`, and `Cli.num` methods.

### Examples

```typescript
import { Cli } from "climonad"

const outputFlag = Cli.str({
  name: "output",
  flag: "--out",
  alias: "-o",
  description: "Specify the output directory",
  default: "dist",
})

const minifyFlag = Cli.bool({
  name: "minify",
  flag: "--minify",
  description: "Enable minification",
  default: false,
})

const threadsFlag = Cli.num({
  name: "threads",
  flag: "--threads",
  description: "Set the number of threads",
  default: 4,
})
```

---

## Attaching Flags to Commands

Flags become functional when attached to commands. You can add them using the `options` property of a command.

```typescript{4}
Cli.cmd({
  name: "build",
  description: "Build the project",
  options: [outputFlag, minifyFlag, threadsFlag],
})
```

---

## Using Flags

Flags are passed to commands as command-line arguments. Use `--` for long flags and `-` for short aliases.

### Example

```bash
my-app build --out build-folder --minify --threads 8
```

## Required Flags

Critical flags can be enforced by marking them as required. Climonad.js validates their presence at runtime.

### Example

```typescript{5}
Cli.str({
  name: "config",
  flag: "--config",
  description: "Path to the configuration file",
  required: true,
})
```

### Behavior

When a required flag is missing:

```bash
my-app build
```

Output:

```
Error: Missing required option: --config
```

---

## Type Validation

Climonad.js ensures that flag values match their defined types, reducing runtime errors.

### Example

```typescript
Cli.num({
  name: "port",
  flag: "--port",
  description: "Set the server port",
})
```

If the user provides an invalid value:

```bash
my-app serve --port not-a-number
```

Output:

```
Error: Invalid value for option --port. Expected a number.
```
