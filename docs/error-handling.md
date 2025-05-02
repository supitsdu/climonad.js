# Error Handling in Climonad.js

This document explains Climonad's error handling system and how to customize error messages for better user experience.

## Table of Contents

- [Introduction](#introduction)
- [Error System Architecture](#error-system-architecture)
- [Error Categories](#error-categories)
- [Default Error Messages](#default-error-messages)
- [Customizing Error Messages](#customizing-error-messages)
- [Advanced Error Handling](#advanced-error-handling)
- [Best Practices](#best-practices)

## Introduction

Effective error handling is crucial for creating user-friendly CLI applications. Climonad provides a flexible error handling system that allows you to:

- Display clear, contextual error messages
- Customize error messages to match your application's style
- Provide helpful suggestions when users make mistakes
- Integrate with logging or telemetry systems

By default, Climonad provides meaningful error messages, but you can completely customize how errors are presented to your users.

## Error System Architecture

Climonad's error handling system consists of several key components:

### CLIError Class

`CLIError` extends JavaScript's native `Error` class with additional properties:

```ts
class CLIError<T extends Record<string, unknown[]>> extends Error {
  constructor(
    public code: keyof T, // The error code (e.g., "TOKEN_NOT_FOUND")
    public args: T[keyof T], // Arguments related to the error
    public message: string, // Human-readable error message
  ) {
    super(message)
    this.name = "CLIError"
  }
}
```

### CLIErrorHandler Class

`CLIErrorHandler` manages error creation and customization:

```ts
class CLIErrorHandler<T extends Record<string, unknown[]> = ErrorCodes> {
  private messages: Partial<{
    [K in keyof T]: (...args: T[K]) => string
  }> = {}

  constructor(overrides: Partial<{ [K in keyof T]: (...args: T[K]) => string }> = {}) {
    this.messages = { ...defaultMessages, ...overrides }
  }

  create<K extends keyof T>(code: K, ...args: T[K]): CLIError<T> {
    const messageFn = this.messages[code]
    const message = messageFn?.(...args) ?? `Unknown error: ${String(code)}`

    return new CLIError<T>(code, args, message)
  }
}
```

### Error Flow

When an error occurs:

1. The relevant component calls `errorHandler.create()` with an error code and arguments
2. The error handler finds the appropriate message function
3. The message function formats a human-readable error message
4. A `CLIError` instance is created and thrown
5. The error is caught by the CLI's run method or propagated to the user's error handler

## Error Categories

Climonad's error codes are organized into several categories:

### Definition Errors

Errors related to command and flag definitions:

- `DEF_CMD_MISSING_NAME`: Command definition is missing a name
- `DEF_FLAG_MISSING_NAME`: Flag definition is missing a name

### Token Errors

Errors related to command-line token processing:

- `TOKEN_NOT_FOUND`: Unknown command or flag
- `TOKEN_DUPLICATE`: Command or flag used multiple times
- `TOKEN_BAD_FORMAT`: Invalid token format
- `TOKEN_INVALID`: Invalid token

### Context Errors

Errors related to command context:

- `CTX_INVALID`: Command used in the wrong context
- `CTX_INVALID_PARENT`: Command used with the wrong parent
- `CTX_WRONG_PARENT`: Incorrect parent command

### Argument Errors

Errors related to flag arguments:

- `ARG_INVALID`: Invalid argument
- `ARG_PARSING_ERROR`: Error parsing flag value
- `ARG_MISSING_VALUE`: Missing value for a flag
- `ARG_INVALID_VALUE`: Invalid value for a flag
- `ARG_INVALID_TYPE`: Invalid type for a flag value

### Requirement Errors

Errors related to required flags:

- `REQ_FLAG_MISSING`: Required flag not provided

### CLI Execution Errors

Errors related to CLI execution:

- `CLI_INVALID_INPUT`: Invalid CLI input
- `CLI_HELP_REPORTER_NOT_SET`: Help reporter not configured
- `CLI_HELP_DISPLAY_FAILED`: Failed to display help
- `CLI_NO_ACTION_FOUND`: No command with an action specified
- `CLI_ACTION_FAILED`: Error executing command action
- `CLI_INPUT_PROCESSING_FAILED`: Failed to process CLI input

### Preset Errors

Errors related to presets:

- `PRESET_NONE_PROVIDED`: No presets provided
- `PRESET_MISSING_KIND`: Preset missing 'kind' property
- `PRESET_MISSING_NAME`: Preset missing 'name' property
- `PRESET_INVALID_KIND`: Invalid preset kind

## Default Error Messages

Climonad provides default error messages for all error codes. Here are examples of default messages:

```ts
// Token error
TOKEN_NOT_FOUND: (token: string) =>
  `Unable to resolve token "${token}". This token is not registered`,

// Required flag error
REQ_FLAG_MISSING: (entry: CLIEntry, parent: CLIEntry) =>
  `${entry?.kind} "${entry?.name}" is required when using "${parent?.name}"`,

// Argument error
ARG_MISSING_VALUE: (entry: CLIEntry) =>
  `Missing value for "${entry?.name}". This flag requires a value`,
```

## Customizing Error Messages

You can customize error messages by creating a custom error handler:

### Basic Error Handler Customization

```ts
import { CLIErrorHandler, ErrorCodes, createCLI } from "climonad"

// Create custom error handler
const errorHandler = new CLIErrorHandler<ErrorCodes>({
  // Override specific error messages
  TOKEN_NOT_FOUND: (token, nodes) => {
    // Suggest similar commands
    const suggestions = nodes
      ?.filter((node) => node.name.startsWith(token.substring(0, 2)))
      .map((node) => node.name)
      .join(", ")

    return `Unknown command "${token}". Did you mean: ${suggestions || "none"}?`
  },

  REQ_FLAG_MISSING: (flag, command) =>
    `The "--${flag.name}" flag is required when using the "${command.name}" command.`,
})

// Use custom error handler with CLI
const cli = createCLI({
  name: "example",
  description: "Example CLI",
  errorHandler,
})
```

### Advanced Customization

You can add styling, multilingual support, or detailed suggestions:

```ts
import { CLIErrorHandler, ErrorCodes } from "climonad"
import chalk from "chalk" // Optional dependency for colors

export const errorHandler = new CLIErrorHandler<ErrorCodes>({
  TOKEN_NOT_FOUND: (token, nodes) => {
    // Find similar commands using Levenshtein distance
    const getSimilar = (input, items) => {
      // Implementation of similarity algorithm
      // ...
    }

    const similar = getSimilar(token, nodes?.map((n) => n.name) || [])
    const suggestions = similar.length ? `\n  Did you mean: ${similar.join(", ")}?` : ""

    return chalk.red(`Error: Unknown command "${chalk.bold(token)}"`) + suggestions
  },

  ARG_INVALID_VALUE: (entry, value) => {
    let message = chalk.red(`Invalid value "${value}" for flag "${entry.name}"`)

    // Add type-specific help
    if (entry.parser?.name === "numberParser") {
      message += "\n  This flag requires a numeric value."
    }

    return message
  },
})
```

## Advanced Error Handling

### Integration with Logging Systems

You can integrate Climonad's error handling with logging systems:

```ts
import { CLIErrorHandler, ErrorCodes } from "climonad"
import logger from "./logger" // Your logging system

export const errorHandler = new CLIErrorHandler<ErrorCodes>({
  // Custom wrapper that logs errors before displaying them
  TOKEN_NOT_FOUND: (token, nodes) => {
    const message = `Unable to resolve token "${token}". This token is not registered`
    logger.warn(`User attempted to use unknown token: ${token}`)
    return message
  },
})
```

### Error Handling Patterns

Here are some effective error handling patterns:

1. **Tiered messaging**: Provide brief errors for common issues and detailed help for complex errors
2. **Progressive disclosure**: Start with basic information, but include hints about how to get more help
3. **Context-sensitive help**: Tailor error messages based on the command context

```ts
// Example of tiered messaging
const errorHandler = new CLIErrorHandler<ErrorCodes>({
  TOKEN_NOT_FOUND: (token) => {
    const basicHelp = `Unknown command: "${token}"`
    const getMoreHelp = 'Run with "--help" for a list of available commands'
    return `${basicHelp}\n${getMoreHelp}`
  },
})
```

### Internationalization (i18n)

For international applications, you can implement i18n:

```ts
import { CLIErrorHandler, ErrorCodes } from "climonad"
import i18n from "./i18n" // Your i18n system

const errorHandler = new CLIErrorHandler<ErrorCodes>({
  TOKEN_NOT_FOUND: (token) => {
    return i18n.translate("errors.token_not_found", { token })
  },
  // Other error messages...
})
```

## Best Practices

### When to Customize Errors

Consider customizing errors when:

- Your CLI targets non-technical users
- You want consistent branding across your application
- You need to integrate with monitoring or analytics
- You want to provide specific guidance for common mistakes
- You need multilingual support

### Error Design Principles

1. **Be specific**: Clearly identify what went wrong
2. **Be actionable**: Tell users how to fix the problem
3. **Be concise**: Keep messages short and to the point
4. **Be helpful**: Provide context and suggestions
5. **Be consistent**: Use a consistent tone and format

### User Experience Considerations

- Consider your audience's technical level
- Use color and formatting judiciously (if supported)
- For complex CLIs, provide examples in error messages
- Link to documentation where appropriate
- Balance brevity with helpfulness

## Examples

### Friendly CLI for Non-Technical Users

```ts
const errorHandler = new CLIErrorHandler<ErrorCodes>({
  TOKEN_NOT_FOUND: (token) =>
    `I couldn't find the command "${token}". Please try "help" to see what commands are available.`,

  ARG_MISSING_VALUE: (entry) => `The "${entry.name}" option needs a value. For example: --${entry.name}=something`,
})
```

### Developer-Focused CLI

```ts
const errorHandler = new CLIErrorHandler<ErrorCodes>({
  TOKEN_NOT_FOUND: (token, nodes) => {
    const available = nodes
      ?.filter((n) => n.parentIndex === 0 && n.kind !== "root")
      .map((n) => n.name)
      .join(", ")

    return `Unknown command "${token}"\nAvailable commands: ${available}`
  },

  ARG_INVALID_VALUE: (entry, value) => {
    let message = `Invalid value for --${entry.name}: "${value}"`

    // Add validation details
    if (entry.parser) {
      message += `\nValidation: ${entry.parser.toString()}`
    }

    return message
  },
})
```

### Debugging-Friendly Error Handler

```ts
const errorHandler = new CLIErrorHandler<ErrorCodes>({
  // Generic wrapper that adds debug info to all errors
  ...Object.fromEntries(
    Object.entries(defaultMessages).map(([key, fn]) => [
      key,
      (...args: any[]) => {
        const originalMessage = fn(...args)
        const debugInfo = `[DEBUG] Error code: ${key}, Args: ${JSON.stringify(args)}`
        return process.env.DEBUG ? `${originalMessage}\n${debugInfo}` : originalMessage
      },
    ]),
  ),
})
```
