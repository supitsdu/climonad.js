# Commands

> Commands are the foundation of any CLI application built with Climonad.js. They define distinct functionalities and can include options, arguments, and subcommands.

---

## Defining Commands

Commands are created using the `Cli.cmd` function. Each command requires a `name` and `description` and can optionally support options and arguments.

### Example

```typescript
import { Cli } from "climonad"

const buildCmd = Cli.cmd({
  name: "build",
  description: "Build the project",
  options: [
    Cli.str({
      name: "output",
      flag: "--out",
      alias: "-o",
      description: "Set output directory",
    }),
  ],
})
```

---

## Command Aliases

Simplify access to commands by adding an `alias` property. Aliases provide shorthand alternatives for invoking commands.

### Example

```typescript{4}
Cli.cmd({
  name: "serve",
  description: "Start the development server",
  alias: "s",
})
```

### Usage

```bash
bun run ./index.js s
```

---

## Nesting Commands

Climonad.js supports nested commands, enabling hierarchical organization for complex applications.

### Example

```typescript{11,16,20}
import { Cli } from "climonad"

const cli = Cli.createCli({
  name: "pm-cli",
  description: "Project and task management CLI",
  commands: [
    Cli.cmd({
      name: "project",
      description: "Manage projects",
      commands: [
        Cli.cmd({
          name: "create",
          description: "Create a project",
          options: [Cli.str({ name: "name", flag: "--name", required: true, description: "Project name" })],
        }),
        Cli.cmd({
          name: "task",
          description: "Manage project tasks",
          commands: [
            Cli.cmd({
              name: "add",
              description: "Add a task",
              options: [
                Cli.str({ name: "project", flag: "--project", required: true, description: "Project ID" }),
                Cli.str({ name: "task", flag: "--task", required: true, description: "Task name" }),
              ],
            }),
          ],
        }),
      ],
    }),
  ],
})
```

### Usage

Invoke nested commands as follows:

```bash
bun run ./index.js project create --name "New Project"
```

```bash
bun run ./index.js project task add --project 123 --task "Define scope"
```

::: warning

#### Commands and flags are scope-specific.

Subcommands cannot be invoked outside their parent command's scope.

```bash
bun run ./index.js create --name "New Project"
```

This will result in an error because `create` is scoped under `project`.

```
Error: Command 'create' not found.
```

:::
