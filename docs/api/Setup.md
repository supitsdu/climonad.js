# `Setup` Class - API Reference

The `Setup` class serves as the central component of Climonad.js, managing CLI initialization, configuration, command execution, and flag validation.

---

## **Constructor**

| Signature                          | Description                                                     |
| ---------------------------------- | --------------------------------------------------------------- |
| `constructor(config: SetupConfig)` | Initializes the CLI with the provided configuration and scopes. |

---

## **Properties**

| Property        | Type                                | Description                                                                               |
| --------------- | ----------------------------------- | ----------------------------------------------------------------------------------------- |
| `name`          | `string`                            | The name of the CLI application.                                                          |
| `scopes`        | `{ global: Scope; current: Scope }` | Contains global and current scopes for managing flags and commands.                       |
| `config`        | `SetupConfig`                       | Configuration object defining CLI name, description, flags, commands, and usage handling. |
| `latestCommand` | `string`                            | Tracks the most recently invoked command.                                                 |

---

## **Methods**

### **Debugging**

| Method    | Returns                         | Description                                              |
| --------- | ------------------------------- | -------------------------------------------------------- |
| `debug()` | `{ global: any; current: any }` | Returns debug information for global and current scopes. |

---

### **Execution**

| Method                                                            | Parameters                                       | Returns         | Description                                                 |
| ----------------------------------------------------------------- | ------------------------------------------------ | --------------- | ----------------------------------------------------------- |
| `run(argv: string[])`                                             | `argv: string[]`                                 | `Promise<void>` | Processes CLI arguments and executes corresponding actions. |
| `runCommandActions(commands: ParsedCommands, flags: ParsedFlags)` | `commands: ParsedCommands`, `flags: ParsedFlags` | `Promise<void>` | Executes the actions associated with parsed commands.       |

---

### **Usage Reporting**

| Method                               | Parameters           | Returns                                               | Description                                            |
| ------------------------------------ | -------------------- | ----------------------------------------------------- | ------------------------------------------------------ |
| `handleUsageReporting()`             | N/A                  | `Promise<void>`                                       | Handles usage reporting based on the `usageFlag`.      |
| `hasUsageReporter(command: Command)` | `command: Command`   | `boolean`                                             | Checks if a usage reporter is available for a command. |
| `getUsageReporter(command: Command)` | `command: Command`   | `(command: Command) => Promise<void> \| void \| null` | Retrieves the usage reporter for a command.            |
| `hasUsageFlag(flags: ParsedFlags)`   | `flags: ParsedFlags` | `boolean`                                             | Checks if the usage flag is present.                   |

---

### **Flag Management**

| Method                                                             | Parameters                                            | Returns        | Description                                                 |
| ------------------------------------------------------------------ | ----------------------------------------------------- | -------------- | ----------------------------------------------------------- |
| `hasFlag(key: string)`                                             | `key: string`                                         | `boolean`      | Checks if a flag exists in the global or current scope.     |
| `getFlag(key: string)`                                             | `key: string`                                         | `Flag \| null` | Retrieves a flag by name from the global or current scope.  |
| `applyDefaults(scope: Scope, flags: Map<string, PrimitiveValues>)` | `scope: Scope`, `flags: Map<string, PrimitiveValues>` | `void`         | Applies default values to flags within the specified scope. |

---

### **Command Management**

| Method                                                              | Parameters                                        | Returns           | Description                                                                        |
| ------------------------------------------------------------------- | ------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------- |
| `hasCmd(key: string)`                                               | `key: string`                                     | `boolean`         | Checks if a command exists in the global or current scope.                         |
| `getCmd(key: string)`                                               | `key: string`                                     | `Command \| null` | Retrieves a command by name from the global or current scope.                      |
| `updateCommandScope(command: Command \| SetupConfig, scope: Scope)` | `command: Command \| SetupConfig`, `scope: Scope` | `void`            | Updates a scope with new flags and commands from a command or setup configuration. |

---

### **Argument Parsing**

| Method                  | Parameters       | Returns               | Description                                                 |
| ----------------------- | ---------------- | --------------------- | ----------------------------------------------------------- |
| `parse(argv: string[])` | `argv: string[]` | `Promise<ParsedArgs>` | Parses CLI arguments and returns parsed flags and commands. |

---

### **Validation**

| Method                                                                                   | Parameters                                                       | Returns | Description                                                 |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| `fromScopeCheckRequirements(scope: Scope, flags: ParsedFlags, commands: ParsedCommands)` | `scope: Scope`, `flags: ParsedFlags`, `commands: ParsedCommands` | `void`  | Validates that all required flags and commands are present. |

---

## **Type Definitions**

### Parsed Types

| Name             | Type                                               | Description                                  |
| ---------------- | -------------------------------------------------- | -------------------------------------------- |
| `ParsedFlags`    | `Map<string, PrimitiveValues>`                     | A map of parsed flags from CLI input.        |
| `ParsedCommands` | `Map<string, CommandAction \| undefined>`          | A map of parsed commands from CLI input.     |
| `ParsedArgs`     | `{ flags: ParsedFlags; commands: ParsedCommands }` | Encapsulates both parsed flags and commands. |

---

### `SetupConfig` Interface

| Property          | Type                                                       | Description                                   |
| ----------------- | ---------------------------------------------------------- | --------------------------------------------- |
| `name`            | `string`                                                   | The name of the CLI application.              |
| `description`     | `string`                                                   | A brief description of the CLI's purpose.     |
| `flags`           | `Flag[] \| undefined`                                      | Optional array of global flags.               |
| `commands`        | `Command[] \| undefined`                                   | Optional array of top-level commands.         |
| `onUsageReporter` | `(command: Command) => Promise<void> \| void \| undefined` | Optional custom usage reporting function.     |
| `usageFlag`       | `string \| undefined`                                      | Name of the usage flag. Defaults to `"help"`. |

---

## **Quick Usage**

```typescript
const app = cli({
  name: "my-cli",
  description: "An example CLI application",
  flags: [
    bool({ name: "verbose", description: "Enable verbose mode" }),
    str({ name: "config", description: "Path to the configuration file" }),
  ],
  commands: [
    cmd({
      name: "build",
      description: "Build the project",
      action: async () => {
        console.log("Building project...")
      },
    }),
  ],
})

// Execute the CLI
app.run(process.argv).catch(console.error)
```

---

## **Notes**

- The `cli` factory simplifies CLI initialization and reuse.
- Usage reporting is handled seamlessly via the `usageFlag` and `onUsageReporter`.
- Scopes (`global` and `current`) ensure proper separation of flags and commands.
