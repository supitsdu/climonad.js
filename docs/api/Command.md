# `Command` Class - API Reference

The `Command` class is a fundamental building block in Climonad.js, representing an individual CLI command with associated flags, subcommands, and actions.

---

## **Constructor**

| Signature                            | Description                                                 |
| ------------------------------------ | ----------------------------------------------------------- |
| `constructor(config: CommandConfig)` | Initializes a new command with the specified configuration. |

---

## **Properties**

| Property          | Type                                                       | Description                                                                          |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `name`            | `string`                                                   | The name of the command.                                                             |
| `description`     | `string`                                                   | A brief description of the command's functionality.                                  |
| `alias`           | `string \| undefined`                                      | An optional shorthand name for the command.                                          |
| `required`        | `boolean`                                                  | Indicates whether this command is mandatory in the CLI context. Defaults to `false`. |
| `flags`           | `Flag[] \| undefined`                                      | An array of flags associated with the command.                                       |
| `commands`        | `Command[] \| undefined`                                   | Subcommands nested under this command.                                               |
| `action`          | `CommandAction \| undefined`                               | The function to execute when the command is invoked.                                 |
| `onUsageReporter` | `(command: Command) => Promise<void> \| void \| undefined` | Custom function to generate usage information for the command.                       |

---

## **Methods**

The `Command` class itself does not define methods, but actions and behaviors are configured via the `action` and `onUsageReporter` properties.

---

## **Command Factory Function**

| Function | Parameters                         | Returns   | Description                                                  |
| -------- | ---------------------------------- | --------- | ------------------------------------------------------------ |
| `cmd`    | `config: CommandConfig \| Command` | `Command` | Creates a new `Command` instance or returns an existing one. |

---

## **Type Definitions**

### Parsed Types

| Name             | Type                                               | Description                                  |
| ---------------- | -------------------------------------------------- | -------------------------------------------- |
| `ParsedFlags`    | `Map<string, PrimitiveValues>`                     | A map of parsed flags from CLI input.        |
| `ParsedCommands` | `Map<string, CommandAction \| undefined>`          | A map of parsed commands from CLI input.     |
| `ParsedArgs`     | `{ flags: ParsedFlags; commands: ParsedCommands }` | Encapsulates both parsed flags and commands. |

### `CommandConfig` Interface

| Property          | Type                                                       | Description                                                     |
| ----------------- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| `name`            | `string`                                                   | The name of the command.                                        |
| `description`     | `string`                                                   | A brief description of the command's purpose.                   |
| `alias`           | `string \| undefined`                                      | Optional shorthand for the command.                             |
| `required`        | `boolean \| undefined`                                     | Indicates whether the command is required. Defaults to `false`. |
| `flags`           | `Flag[] \| undefined`                                      | Optional array of flags associated with the command.            |
| `commands`        | `Command[] \| undefined`                                   | Optional array of nested subcommands.                           |
| `action`          | `CommandAction \| undefined`                               | Function executed when the command is invoked.                  |
| `onUsageReporter` | `(command: Command) => Promise<void> \| void \| undefined` | Optional custom usage reporting function.                       |

---

## **Quick Usage**

```typescript
// Define a command with flags and a nested subcommand
const startCommand = cmd({
  name: "start",
  description: "Start the application",
  flags: [
    bool({
      name: "verbose",
      alias: "v",
      description: "Enable verbose output",
    }),
    str({
      name: "env",
      alias: "e",
      description: "Specify the environment",
      required: true,
    }),
  ],
  action: async ({ flags }) => {
    console.log("Starting application with environment:", flags.get("env"))
  },
  commands: [
    cmd({
      name: "server",
      description: "Start the server",
      action: async () => {
        console.log("Server is starting...")
      },
    }),
  ],
})
```
