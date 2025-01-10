### `Scope` Class API Reference (Internal Use Only)

The `Scope` class is an internal component of the framework, responsible for managing flags, commands, and their associated metadata. It facilitates the validation, organization, and execution of CLI components.

---

#### Constructor

| Signature       | Description                            |
| --------------- | -------------------------------------- |
| `constructor()` | Initializes an empty `Scope` instance. |

---

#### Properties

| Property                 | Type                                                       | Description                                      |
| ------------------------ | ---------------------------------------------------------- | ------------------------------------------------ |
| `flags`                  | `Map<string, number>`                                      | Maps flag names and aliases to their indices.    |
| `commands`               | `Map<string, number>`                                      | Maps command names and aliases to their indices. |
| `flagsList`              | `Flag[]`                                                   | Stores all added flags.                          |
| `commandsList`           | `Command[]`                                                | Stores all added commands.                       |
| `requiredFlags`          | `number[]`                                                 | Indices of required flags.                       |
| `requiredCommands`       | `number[]`                                                 | Indices of required commands.                    |
| `flagsWithDefaultValues` | `number[]`                                                 | Indices of flags with default values.            |
| `commandsStack`          | `number[]`                                                 | Indices of commands in the stack.                |
| `usageReporters`         | `Map<string, (command: Command) => Promise<void> \| void>` | Maps command names to their usage reporters.     |

---

#### Methods

##### Debugging

| Method            | Description                                                                         |
| ----------------- | ----------------------------------------------------------------------------------- |
| `debug(): object` | Returns the internal state of the `Scope`, including flags, commands, and metadata. |

##### Flag Management

| Method                                                                             | Description                                                               |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `forEachRequiredFlag(callback: (flag: Flag, index: number) => void): void`         | Executes a callback for each required flag.                               |
| `forEachFlagWithDefaultValue(callback: (flag: Flag, index: number) => void): void` | Executes a callback for each flag with a default value.                   |
| `hasFlag(key: string): boolean`                                                    | Checks if a flag exists.                                                  |
| `getFlagIndex(key: string): number \| null`                                        | Retrieves the index of a flag by its name or alias.                       |
| `getFlag(key: string): Flag \| null`                                               | Retrieves a flag by its name or alias.                                    |
| `addFlag(entry: Flag): void`                                                       | Adds a flag to the `Scope`. Validates the entry as an instance of `Flag`. |

##### Command Management

| Method                                                                              | Description                                                                     |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `forEachRequiredCommand(callback: (command: Command, index: number) => void): void` | Executes a callback for each required command.                                  |
| `hasCmd(key: string): boolean`                                                      | Checks if a command exists.                                                     |
| `getCmdIndex(key: string): number \| null`                                          | Retrieves the index of a command by its name or alias.                          |
| `getCmd(key: string): Command \| null`                                              | Retrieves a command by its name or alias.                                       |
| `addCmd(entry: Command): void`                                                      | Adds a command to the `Scope`. Validates the entry as an instance of `Command`. |

##### Usage Reporter Management

| Method                                                                                        | Description                                               |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `setUsageReporter(name: string, reporter: (command: Command) => Promise<void> \| void): void` | Sets a usage reporter for a specific command.             |
| `hasUsageReporter(name: string): boolean`                                                     | Checks if a usage reporter exists for a specific command. |
| `getUsageReporter(name: string): (command: Command) => Promise<void> \| void`                 | Retrieves the usage reporter for a specific command.      |

##### General Utility

| Method                      | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| `has(key: number): boolean` | Checks if an index corresponds to a flag or command. |

---

### Notes

The `Scope` class is not directly exposed as part of the public API. It is intended for internal use within the CLI framework to organize and validate flags, commands, and their associated behaviors.
