<div align="center">

# **climonad.js**

**Next-Gen CLI framework**

[![NPM](https://img.shields.io/npm/v/climonad?color=blue)](https://www.npmjs.com/package/climonad)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

</div>

---

## **Overview**

`climonad.js` is a feature-rich framework for building structured and maintainable command-line tools.

> [!WARNING]
> This library is in early development, and APIs may change.

### Key Features:

- 🌳 **Hierarchical Commands**: Build nested commands and subcommands effortlessly.
- 🛠️ **Powerful Flag Parsing**: Manage flags with defaults, requirements, and validation.
- 📋 **Custom Usage Messages**: Provide clear and tailored help text for every command.
- 🗂️ **Scoped Management**: Separate global and local flags for better organization.

---

## **Installation**

Install via npm:

```bash
npm install climonad
```

---

## **Quick Example**

Here’s a simple CLI configuration:

```typescript
const app = cli({
  name: "cli",
  description: "A simple CLI",

  flags: [str({ name: "config", alias: "c", description: "Config file", required: true })],

  commands: [
    cmd({
      name: "init",
      description: "Initialize a new project",
      flags: [str({ name: "name", description: "Project name", required: true })],
      action: async ({ flags }) => {
        console.log("Initializing project:", flags.get("name"))
        console.log("Using config file:", flags.get("config"))
      },
    }),
  ],
})

app.run(process.argv)
```

**Run your CLI:**

```bash
node cli init --name my-project -c config.json
```

**Output:**

```
Initializing project: my-project
Using config file: config.json
```

---

## **Learn More**

- **[API Documentation](docs/api/README.md)**
- **[Contribution Guide](CONTRIBUTING.md)**

---

## **License**

This project is licensed under the [MIT License](LICENSE).
