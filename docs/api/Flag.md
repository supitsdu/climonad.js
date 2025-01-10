# `Flag` Class - API Reference

The `Flag` class defines flags for command-line interfaces, including their metadata, type, default values, and parsers. It supports predefined constructors for boolean, string, and numeric flags, as well as customizable parsers.

---

## **Constructor**

| Signature                                       | Description                                         |
| ----------------------------------------------- | --------------------------------------------------- |
| `constructor(config: FlagConstructorConfig<T>)` | Initializes a flag with the provided configuration. |

---

## **Properties**

| Property      | Type                  | Description                                                        |
| ------------- | --------------------- | ------------------------------------------------------------------ |
| `type`        | `string`              | The type of the flag (`"boolean"`, `"string"`, `"number"`, etc.).  |
| `name`        | `string`              | The unique name of the flag.                                       |
| `description` | `string`              | A brief description of the flag's purpose.                         |
| `required`    | `boolean`             | Indicates if the flag is mandatory. Defaults to `false`.           |
| `default`     | `T \| undefined`      | The default value for the flag, if not provided by the user.       |
| `alias`       | `string \| undefined` | An optional shorthand for the flag.                                |
| `parser`      | `Parser<T>`           | The parser function used to validate and process the flag's value. |

---

## **Methods**

| Method | Parameters | Returns | Description                                                                                                                             |
| ------ | ---------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `N/A`  | N/A        | N/A     | No instance methods defined for the `Flag` class. Flag behavior is determined through the `parser` property and usage within CLI logic. |

---

## **Predefined Flag Constructors**

| Constructor                         | Parameters                    | Returns         | Description             |
| ----------------------------------- | ----------------------------- | --------------- | ----------------------- |
| `bool(config: FlagConfig<boolean>)` | `config: FlagConfig<boolean>` | `Flag<boolean>` | Creates a boolean flag. |
| `str(config: FlagConfig<string>)`   | `config: FlagConfig<string>`  | `Flag<string>`  | Creates a string flag.  |
| `num(config: FlagConfig<number>)`   | `config: FlagConfig<number>`  | `Flag<number>`  | Creates a numeric flag. |

---

## **Flag Parsing**

### Parser Functions

| Parser           | Parameters             | Returns                   | Description                                                                       |
| ---------------- | ---------------------- | ------------------------- | --------------------------------------------------------------------------------- |
| `boolFlagParser` | `config: ParserConfig` | `Promise<boolean>`        | Parses a boolean value. Defaults to `true` if no value is provided.               |
| `strFlagParser`  | `config: ParserConfig` | `Promise<string \| null>` | Parses a string value, ensuring it doesn't conflict with other flags or commands. |
| `numFlagParser`  | `config: ParserConfig` | `Promise<number \| null>` | Parses a numeric value, returning `null` if the value is not valid.               |

### **Default Parser**

| Name            | Description                                                                         |
| --------------- | ----------------------------------------------------------------------------------- |
| `defaultParser` | Throws an error if a parser is not provided. Used as the fallback parser for flags. |

---

## **Type Definitions**

### **FlagConfig Interface**

| Property      | Type                     | Description                                        |
| ------------- | ------------------------ | -------------------------------------------------- |
| `name`        | `string`                 | The name of the flag.                              |
| `description` | `string`                 | A description of the flag.                         |
| `alias`       | `string \| undefined`    | An optional shorthand for the flag.                |
| `required`    | `boolean \| undefined`   | Whether the flag is required. Defaults to `false`. |
| `default`     | `T \| undefined`         | The default value for the flag.                    |
| `parser`      | `Parser<T> \| undefined` | A function to parse the flag's value.              |

---

### **ParserConfig Interface**

| Property   | Type                       | Description                            |
| ---------- | -------------------------- | -------------------------------------- |
| `next`     | `string[]`                 | Array of tokens from the CLI input.    |
| `index`    | `number`                   | Current index in the `next` array.     |
| `hasFlag`  | `(key: string) => boolean` | Checks if a flag exists.               |
| `hasCmd`   | `(key: string) => boolean` | Checks if a command exists.            |
| `setIndex` | `(index: number) => void`  | Updates the index in the `next` array. |

---

### **Parser Type**

| Signature                                                                  | Description                                             |
| -------------------------------------------------------------------------- | ------------------------------------------------------- |
| `(this: Flag<T>, config: ParserConfig) => T \| null \| Promise<T \| null>` | Defines the function signature for parsing flag values. |

---

## **Quick Usage**

```typescript
import { bool, str, num } from "climonad"

// Define a boolean flag
const verbose = bool({
  name: "verbose",
  description: "Enable verbose mode",
  alias: "v",
  default: false,
})

// Define a string flag
const configPath = str({
  name: "config",
  description: "Path to the configuration file",
  required: true,
})

// Define a numeric flag
const timeout = num({
  name: "timeout",
  description: "Request timeout in seconds",
  default: 30,
})

// Use flags in a CLI setup
console.log(verbose, configPath, timeout)
```

---

## **Notes**

- The `Flag` class allows seamless flag creation with flexible parsing options.
- Use the predefined constructors (`bool`, `str`, `num`) for common flag types.
- Custom parsers can be provided for more advanced flag processing requirements.
