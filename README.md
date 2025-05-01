<div align="center">

![Climonad Banner](/docs/banner.webp)

[![NPM](https://img.shields.io/npm/v/climonad?color=blue)](https://www.npmjs.com/package/climonad)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

</div>

---

A minimal, fast, and scalable CLI framework built on functional programming and type-safe design. Offers a clean, declarative API without boilerplate or opinions—just the essentials for building robust command-line tools.

Don’t let the simplicity fool you. Climonad handles the hard stuff under the hood: nested commands, scoped flags, safe parsing, and isolation for increased testability — without introducing runtime complexity. It’s one of the few CLI frameworks that gets type safety, modular design, and developer ergonomics right, all at once.

---

## Quick Start

### 1. Define the CLI Application

```ts
// cli.ts
import { createCLI } from "climonad"

export const cli = createCLI({
  name: "my-cli",
  description: "A powerful CLI application",
  version: "1.0.0",
})
```

### 2. Add a Command

```ts
// commands.ts
import { str, num, bool } from "climonad"
import { cli } from "./cli"

export const run = cli.cmd({
  name: "run",
  description: "Run the application",
  action(flags) {
    console.log("Running with options:", flags.getAll())
    return { success: true }
  },
})
```

### 3. Run the CLI

```ts
// index.ts
import { cli } from "./cli"
import "./commands" // Registers your command definitions

cli.run(process.argv.slice(2)).catch((e) => console.error(e))
```

---

## Defining Flags

Climonad provides built-in types for common flag values:

```ts
import { str, num, bool } from "climonad"
import { cli } from "./cli"

cli.use(
  str({
    name: "env",
    aliases: ["e"],
    description: "Target environment",
    default: "development",
    required: true,
  }),

  num({
    name: "port",
    aliases: ["p"],
    description: "Port number",
    default: 3000,
  }),

  bool({
    name: "force",
    aliases: ["f"],
    description: "Force the operation",
    default: false,
  }),
)
```

---

## Defining Subcommands

Build nested command structures to support more complex CLI tools:

```ts
import { cli } from "./cli"

const database = cli.cmd({
  name: "db",
  description: "Database operations",
})

database.cmd({
  name: "migrate",
  description: "Run database migrations",
  action(flags) {
    console.log("Running migrations on", flags.get("database"))
  },
})

database.cmd({
  name: "backup",
  description: "Backup the database",
  action(flags) {
    console.log("Backing up to", flags.get("output"))
  },
})
```

---

## Why?

- 🧩 **Composable Design** – Use functional patterns to build scalable, nested commands.
- 🧪 **Testable by Default** – Commands are defined independently for easier unit testing.
- ⚡ **Lightweight & Fast** – Zero dependencies, minimal runtime overhead.
- 🧱 **Modular Architecture** – Reuse commands and flags across projects with clean separation.
- ✍️ **Declarative API** – Clear, predictable structure with minimal boilerplate.
- 🛠️ **Built-in Error Handling** – Structured, user-friendly error messages out of the box.

---

## Contributing

Contributions are welcome. Please see our [Contributing Guide](./CONTRIBUTING.md) to learn how to get involved.

---

## Security

To report security issues or vulnerabilities, please refer to our [Security Policy](./SECURITY.md).

---

## License

Released under the [MIT License](./LICENSE).
