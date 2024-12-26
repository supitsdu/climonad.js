# Usage API Reference

## Overview

Easily generate dynamic and customizable help messages for your CLI applications. This API ensures you can structure help outputs tailored to your needs.

The `--help` or `-h` flags trigger the `parse()` method, which provides a `generateHelp()` function. This function outputs a `CommandUsage` object that you can format as desired.

---

## Key Concept: `CommandUsage`

The `CommandUsage` object defines the structure of your help message:

```typescript
interface CommandUsage {
  name: string // The command's name
  description: string // A short description of the command
  commands?: CommandInfo[] // Subcommands, if any
  flags?: FlagInfo[] // Available options or flags
}
```

---

## Quick Start Guide

> [!TIP]
> Use the `generateHelp()` function to obtain structured help data, ready for customization.

### Basic Example

Generate a help message for a simple CLI application:

```typescript{16}
import { Cli } from "climonad";
import { logger } from './my-custom-logger'

const cli = Cli.createCli({
  name: "my-cli",
  description: "A simple example CLI",
  commands: [
    Cli.cmd({
      name: "build",
      description: "Build the project",
    }),
  ],
});

try {
  const parsed = cli.parse(process.argv.slice(2));
  const helpMessage = parsed.generateHelp();

  if (helpMessage) {
    logger.help(helpMessage);
  }
} catch (err) {
  console.error(err);
}
```

---

## Customizing Help Output

Use a custom formatter to style your help messages:

```typescript
import type { CommandUsage } from "climonad"

function formatHelp(usage: CommandUsage): string {
  let output = `Usage: ${usage.name} [options] [command]\n\n`
  output += `${usage.description}\n\n`

  if (usage.flags?.length) {
    output += "Options:\n"
    for (const flag of usage.flags) {
      output += `  ${flag.name}\t${flag.description}\n`
    }
    output += "\n"
  }

  if (usage.commands?.length) {
    output += "Commands:\n"
    for (const cmd of usage.commands) {
      output += `  ${cmd.name}\t${cmd.description}\n`
    }
  }

  return output
}
```

::: details Example Output
**Sample Output of a Help Message:**

```
Usage: my-cli [options] [command]

A simple example CLI

Options:
  --help, -h	Show help

Commands:
  build	Build the project
```

:::

---

## Sample Outputs

### General Help

The root command’s help message:

```typescript
{
  name: "my-cli",
  description: "A simple example CLI",
  flags: [
    {
      name: "--help, -h",
      type: "boolean",
      description: "Show help",
      flag: "--help",
      alias: "-h",
    },
  ],
  commands: [
    {
      name: "build",
      flag: "build",
      description: "Build the project",
    },
  ],
}
```

### Command-Specific Help

A help message for the `build` subcommand:

```typescript{2}
{
  name: "build",
  description: "Build the project",
  flags: [
    {
      name: "--out, -o",
      type: "string",
      description: "Specify output directory",
      flag: "--out",
      alias: "-o",
    },
  ],
}
```

---

## Advanced Features

### Nested Commands

Organize complex CLIs with nested commands:

```typescript
const cli = Cli.createCli({
  name: "my-cli",
  description: "A CLI for managing projects",
  commands: [
    Cli.cmd({
      name: "project",
      description: "Manage projects",
      commands: [
        Cli.cmd({
          name: "create",
          description: "Create a new project",
        }),
      ],
    }),
  ],
})
```

> [!TIP]
> Leverage nested commands to create intuitive multi-level CLI structures. E.g.: running `my-cli project --help` outputs help details specific to the `project` command

### Custom Formatter Example

Take full control of the format of your help messages:

```typescript
function customHelpFormatter(usage: CommandUsage): string {
  const sections: string[] = []

  sections.push(`${usage.name.toUpperCase()}\n`)
  sections.push(`Description: ${usage.description}\n`)

  if (usage.commands?.length) {
    sections.push("Available Commands:")
    usage.commands.forEach((cmd) => {
      sections.push(`  ${cmd.name.padEnd(15)} ${cmd.description}`)
    })
  }

  if (usage.flags?.length) {
    sections.push("\nOptions:")
    usage.flags.forEach((flag) => {
      sections.push(`  ${flag.name.padEnd(15)} ${flag.description}`)
    })
  }

  return sections.join("\n")
}
```

---

## Why Use This API?

- **Unified Help Messages**: Create consistent, professional help outputs across all commands.
- **Flexibility**: Format messages to suit your application style.
- **Nested Commands**: Simplify handling of complex CLI structures.
- **Non-Intrusive**: Help generation only activates when requested, keeping normal execution unaffected.
