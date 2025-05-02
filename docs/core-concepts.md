# Core Concepts

This document explains the fundamental concepts and architecture of Climonad.js. Understanding these concepts will help you build effective CLI applications with the framework.

## Table of Contents

- [CLI Architecture](#cli-architecture)
- [Commands and Flags](#commands-and-flags)
- [Registry System](#registry-system)
- [Parser Functionality](#parser-functionality)
- [Error Handling](#error-handling)
- [Help System](#help-system)
- [Presets](#presets)

## CLI Architecture

Climonad is built on a clean, tree-based architecture where each node in the tree represents a command or flag.

### The CLI Class

The `CLI` class is the main entry point for creating a command-line interface:

```ts
const cli = createCLI({
  name: "example-cli",
  description: "An example CLI application",
})
```

Internally, the CLI manages:

- A registry of all commands and flags
- A parser for handling command-line tokens
- An error handler for graceful error management
- A help reporter for displaying help information

The `createCLI` function is a convenient factory that constructs a new CLI instance with appropriate defaults.

### Command Tree

Climonad organizes commands in a tree structure where:

- The root node is your main CLI application
- Each command can have child commands and flags
- Commands are organized hierarchically, allowing for deeply nested command structures

This tree structure allows for intuitive command organization and clean separation of concerns.

## Commands and Flags

### Commands

Commands are the primary interaction points in your CLI. They represent actions that users can perform.

```ts
const runCmd = cli.cmd({
  name: "run",
  description: "Run the application",
  action: async (flags) => {
    // Command implementation
  },
})
```

Each command:

- Has a unique name and description
- Can have an action function that executes when the command is invoked
- Can have child commands and flags
- Can be nested to arbitrary depths

### Flags

Flags provide options that modify command behavior. They can be boolean switches or accept values.

```ts
const verboseFlag = bool({
  name: "verbose",
  description: "Enable verbose output",
  default: false,
  aliases: ["v"],
})
```

Key flag concepts:

- Flags can have aliases (e.g., `-v` for `--verbose`)
- Flags can be required or optional
- Flags can have default values
- Flags can have custom validation logic

### Command Nesting

Commands can be nested to create intuitive command hierarchies:

```ts
const user = cli.cmd({ name: "user", description: "User management" })
const create = user.cmd({ name: "create", description: "Create a user" })
const admin = create.cmd({ name: "admin", description: "Create an admin user" })
```

This enables commands like `cli user create admin` with each part of the command path having its own context and behavior.

## Registry System

The registry system is the backbone of Climonad, managing all command and flag entries.

### Entry Registration

When you define a command or flag, it's registered in the CLI registry:

1. Each entry gets a unique index
2. Parent-child relationships are recorded
3. Requirements and defaults are tracked

The registry keeps track of:

- All commands and flags in the CLI
- Parent-child relationships between entries
- Required flags for each command
- Default values for flags

### Parent-Child Relationships

The registry maintains two types of relationships:

- **Dependencies**: Track which entries are children of which parent entries
- **Requirements**: Track which flags are required by which commands

## Parser Functionality

The parser is responsible for interpreting command-line arguments and mapping them to registered commands and flags.

### Token Handling

1. Each entry has tokens (the command name and any aliases)
2. The parser matches input tokens against registered entries
3. Flags with values capture the next token as their value

### Resolution Process

When resolving the command line:

1. **Token Resolution**: Map tokens to registered commands and flags
2. **Validation**: Ensure tokens are valid in their current context
3. **Default Population**: Add default values for flags not explicitly set
4. **Requirements Enforcement**: Ensure all required flags are provided

### State Management

During parsing, the parser maintains several sets:

- **Expected**: Entries that could be used at the current point
- **Current**: Entries that have actually been used
- **Excluded**: Entries that can no longer be used due to context changes

## Error Handling

Climonad provides a flexible error handling system that you can customize.

### Error Types

Common error scenarios include:

- **TOKEN_NOT_FOUND**: Unknown command or flag
- **TOKEN_DUPLICATE**: Command or flag used multiple times
- **CTX_INVALID**: Command used in the wrong context
- **REQ_FLAG_MISSING**: Required flag not provided
- **ARG_INVALID_VALUE**: Invalid value for a flag

### Custom Error Messages

You can provide your own error messages for better user experience:

```ts
const errorHandler = new CLIErrorHandler({
  TOKEN_NOT_FOUND: (token, nodes) => {
    // Custom error message logic
    return `Unknown command: "${token}". Did you mean one of these: ...?`
  },
})
```

## Help System

The help system allows you to provide contextual help to users.

### Help Reporter

The help reporter defines how help information is displayed:

```ts
const helpReporter = ({ commands, flags, root }) => {
  // Custom help output logic
  console.log(`${root.name} - ${root.description}`)
  // Display commands and flags...
}
```

### Help Configuration

Configure help behavior when creating the CLI:

```ts
const cli = createCLI({
  // ...
  help: true, // or "custom-help-flag"
  helpReporter,
})
```

This allows users to access help with `--help` or your custom help flag.

## Presets

Presets provide reusable flag definitions with built-in validation.

### Built-in Presets

Climonad includes several built-in presets:

- **bool**: Boolean flags (switches without values)
- **str**: String flags with basic validation
- **num**: Number flags with numeric validation

```ts
// Boolean flag
const verboseFlag = bool({
  name: "verbose",
  aliases: ["v"],
  default: false,
})

// String flag
const outputFlag = str({
  name: "output",
  aliases: ["o"],
  required: true,
})

// Number flag
const portFlag = num({
  name: "port",
  default: 3000,
})
```

### Custom Presets

You can create custom presets for specialized validation:

```ts
function hex(config) {
  return createPreset("flag", config, (input) => {
    const hexRegex = /^#?[0-9A-Fa-f]+$/
    return hexRegex.test(input) ? CLI.Ok(input) : CLI.Error(null)
  })
}

const colorFlag = hex({
  name: "color",
  default: "#000000",
})
```

This pattern allows you to encapsulate validation logic and reuse it across your application.
