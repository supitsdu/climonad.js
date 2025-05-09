<div align="center">

![Climonad Banner](/docs/banner.webp)

[![NPM](https://img.shields.io/npm/v/climonad?color=blue)](https://www.npmjs.com/package/climonad)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

</div>

---

A no-nonsense, zero-dependency CLI framework for developers who prefer their tools lean, typed, and composable. Climonad won’t hold your hand—but it won’t get in your way, either.

Most CLI frameworks overpromise and underdeliver. Climonad does neither. It gives you a clean, type-safe foundation to build powerful CLIs **_your way_**—without the bloat or boilerplate.

Functional where it counts. Testable by default. Easy to start, endlessly flexible. No fluff. No footguns.

---

## 🧠 Why?

Built for developers who want complete control over their CLI tools. It avoids magic, embraces type safety, and scales from tiny scripts to full-featured CLIs without dragging opinions along.

---

## ⚙️ Setup In Four Steps

Get rolling fast without hidden complexity. Define what you need, skip what you don’t.

### 1. Define the CLI App

```ts
// cli.ts
import { createCLI } from "climonad"

export const cli = createCLI({
  name: "example-cli",
  description: "An example CLI application",
})
```

### 2. Define Your Flags

```ts
// flags.ts
import { bool } from "climonad"

export const helpFlag = bool({
  name: "help",
  description: "Display help information",
  default: false,
  aliases: ["h"],
})

export const verboseFlag = bool({
  name: "verbose",
  description: "Verbose mode",
  default: false,
  aliases: ["v"],
})
```

### 3. Register Commands

```ts
// command.ts
import { cli } from "./cli"

export const runCmd = cli.cmd({
  name: "run",
  description: "Run the application",
  action: async (args) => {
    console.log("Running the application with args:", args)
  },
})

export const testCmd = runCmd.cmd({
  name: "test",
  description: "Test the application",
  action: async (args) => {
    console.log("Testing the application with args:", args)
  },
})
```

### 4. Wire It Up

```ts
// index.ts
import { cli } from "./cli"
import "./command"
import { helpFlag, verboseFlag } from "./flags"

cli.use(helpFlag, verboseFlag)

cli.run(process.argv.slice(2)).catch((error) => {
  console.error("Error running CLI:", error)
  process.exit(1)
})
```

---

## 🧾 You Control Help Output

Climonad doesn't guess what your help experience should look like. You're in charge of what's printed when users ask for help.

### 1. Create a Help Reporter

```ts
// help.ts
import { CLIHelpConstructor, createCLIHelp } from "climonad"

export const helpReporter = ({ commands, flags, root }: CLIHelpConstructor) => {
  console.log(`\n${root.name} - ${root.description}\n`)

  if (commands.length > 0) {
    console.log("Commands:")
    for (const cmd of commands) {
      console.log(`  ${cmd.name}  - ${cmd.description}`)
    }
  }

  if (flags.length > 0) {
    console.log("\nFlags:")
    for (const flag of flags) {
      console.log(`  --${flag.name}  - ${flag.description}`)
    }
  }

  console.log("")
}

// Create a CLIHelp instance that uses your reporter
export const cliHelp = createCLIHelp(helpReporter)
```

### 2. Plug It In

```ts
// cli.ts
import { createCLI } from "climonad"
import { cliHelp } from "./help"

export const cli = createCLI({
  name: "example-cli",
  description: "An example CLI application",
  help: cliHelp,
})
```

### 🛎️ Custom Help Configuration

Want to change the help behavior? The `createCLIHelp` function takes options to customize your help trigger:

```ts
// Custom name and kind
const assistHelp = createCLIHelp(helpReporter, {
  name: "assist", // Changes flag/command name from "help" to "assist"
  description: "Show assistance information",
  // kind: "command", // Makes it a command instead of a flag
  aliases: ["a", "?"], // Custom aliases
})
```

Now your users can get help with:

```bash
# If kind is "flag" (default)
example-cli --assist

# If kind is "command"
# example-cli assist
```

> [!WARNING]
> If you don't supply a help instance with a reporter function, help output won't be shown—even if users try to access it.

---

## 💥 Make Errors Yours

Don’t let unhandled errors ruin the CLI experience. Climonad lets you define responses for common CLI mistakes so your tool speaks your language—not ours.

### 1. Define the Handler

```ts
// errors.ts
import { CLIErrorHandler, ErrorCodes } from "climonad"

export const errorHandler = new CLIErrorHandler<ErrorCodes>({
  TOKEN_NOT_FOUND: (token, nodes) => {
    const suggestions = nodes
      ?.filter((node) => node.name.startsWith(token))
      .map((node) => node.name)
      .join(", ")

    return `Unknown token \"${token}\". Did you mean: ${suggestions}?`
  },

  REQ_FLAG_MISSING: (flagName) => `Oops! The flag \"--${flagName}\" is required.`,
})
```

### 2. Hook It Up

```ts
// cli.ts
import { createCLI } from "climonad"
import { errorHandler } from "./errors"

export const cli = createCLI({
  name: "example-cli",
  description: "An example CLI application",
  errorHandler,
})
```

### 🧠 When To Customize

Custom error handlers shine when:

- You want error messages in a specific tone or language
- Your CLI targets less technical users
- You want to plug in logging or telemetry

> [!NOTE]
> Unhandled errors fall back to default Climonad messaging.

---

## 🧬 Deeply Nested Commands

Most CLI frameworks stop at subcommands. Climonad goes further.

Commands can nest indefinitely, allowing you to structure large command trees in clean, composable layers. Whether you’re building a microservice runner, deployment pipeline, or multi-utility toolkit, you won’t hit a wall.

### Example

```ts
const root = createCLI({ name: "cli" })

const user = root.cmd({
  name: "user",
  description: "Manage users",
})

const create = user.cmd({
  name: "create",
  description: "Create a user",
  action: () => {
    console.log("User created!")
  },
})

const admin = create.cmd({
  name: "admin",
  description: "Create an admin user",
  action: () => {
    console.log("Admin user created!")
  },
})
```

Your CLI can now handle:

```bash
cli user create admin
```

Climonad doesn't impose limits on depth or nesting, so you can model your CLI the way your users think—not the way your framework dictates.

---

## 🧩 Define Custom Entry Presets

If you want to create reusable validation logic for flags, `createPreset` is your tool.

> [!IMPORTANT]
> Climonad doesn't yet support positional arguments or lists out of the box, but presets give you composable power now.

### Example: Hex Color Flag

```ts
// presets.ts
import { CLIDefinition, CLIEntryPreset } from "climonad"
import { CLI } from "climonad"
import { createPreset } from "climonad"

export function hex(config: CLIDefinition<string>): CLIEntryPreset<string> {
  return createPreset("flag", config, (input) => {
    const hexRegex = /^#?[0-9A-Fa-f]+$/
    return hexRegex.test(input) ? CLI.Ok(input) : CLI.Error(null)
  })
}
```

### Use It

```ts
export const colorFlag = hex({
  name: "color",
  description: "Set the color",
  default: "#000000",
  required: true,
  aliases: ["c"],
})
```

Presets are the preferred way to express custom validations currently.

---

## 🎯 Let’s Be Real

> [!CAUTION]
> Climonad is optimized, but no abstraction is free. Here's where performance could take a hit:
>
> - **Deep Command Nesting** – While supported, very deep command trees can add processing overhead.
> - **Large Token Sets** – Matching against many tokens might introduce delays.
> - **Complex Requirements** – Intricate validation logic may slow down command resolution.

### In Practice

> [!TIP]
> Climonad is built with fast initialization and predictable performance in mind:
>
> - **Time Complexity**: O(1) to O(n) depending on input size.
> - **Space Complexity**: Linear with respect to commands and flags.
> - **Runtime**: Constant-time lookups and efficient traversal.

It's designed for real-world use—fast enough for scripts, structured enough for full CLI suites.

---

## 💡 Public API Stability

Climonad is currently in alpha stage, and while we strive to minimize breaking changes, some internal implementations might change.

For the most stable experience:

- Use the helper functions (`createCLI`, `createCLIHelp`) rather than directly instantiating classes
- Rely on the documented public API rather than internal implementation details
- Check the changelog when upgrading between alpha/beta versions

We'll clearly document any breaking changes and provide migration paths as needed.

---

## 🤝 Open to Ideas

Whether it’s a sharp bug fix, a novel feature idea, or just feedback on the philosophy—PRs and issues welcome. Check the [Contributing Guide](./CONTRIBUTING.md) before you dive in.

---

## 🔐 Responsible Disclosure

To report vulnerabilities or sensitive issues, please read our [Security Policy](./SECURITY.md).

---

## 📄 License

Released under the [MIT License](./LICENSE).
