# CLI

> Building powerful command-line interfaces with Climonad.

---

## Import

The `createCli` method serves as the entry point for setting up your CLI configuration. Import it from `climonad`:

```typescript
import { Cli } from "climonad"

const cli = Cli.createCli({
  // Configuration goes here
})
```

---

## Configuration Parameters

### `name` (string, required)

The name of your CLI application. This is displayed in help outputs.

```typescript
name: "my-app"
```

### `description` (string, optional)

A short description of your CLI application, also shown in help outputs.

```typescript
description: "A powerful CLI application."
```

### `commands` (array, optional)

A list of commands your CLI supports. Each command is defined using `Cli.cmd`.

```typescript
commands: [
  Cli.cmd({
    name: "build",
    description: "Build the project.",
  }),
  Cli.cmd({
    name: "serve",
    description: "Start the development server.",
  }),
]
```

### `options` (array, optional)

Global options that apply to all commands. Define them using `Cli.str`, `Cli.bool`, or `Cli.num`.

```typescript
options: [
  Cli.bool({
    name: "verbose",
    flag: "--verbose",
    description: "Enable verbose output.",
  }),
]
```

---

## Example Setup

Below is an example of setting up a CLI application:

::: code-group

```typescript [index.ts]
import { Cli } from "climonad"
import greetCmd from "./greetCmd"

const cli = Cli.createCli({
  name: "my-cli",
  description: "A simple example CLI",
  commands: [greetCmd],
  options: [
    Cli.bool({
      name: "verbose",
      flag: "--verbose",
      description: "Enable verbose output.",
    }),
  ],
})

try {
  const parsed = cli.parse(process.argv.slice(2))
  console.debug(parsed)
} catch (err) {
  // Handle parsing errors
}
```

```typescript [greetCmd.ts]
import { Cli } from "climonad"

const nameFlag = Cli.str({
  name: "name",
  flag: "--name",
  alias: "-n",
  description: "Name to greet",
})

export default Cli.cmd({
  name: "greet",
  description: "Say hello",
  options: [nameFlag],
})
```

:::

---

## Best Practices

- **Be Descriptive**: Use clear, meaningful names and descriptions for commands and options.
- **Organize Commands**: Group related commands logically for better usability.
- **Keep Options Global Only When Necessary**: Limit global options to configurations that apply universally.
