import { describe, expect, it } from "vitest"
import { defaultMessages } from "../../src/errors"
import type { CLIEntry } from "../../src/types"

describe("Error Messages", () => {
  // Test fixtures
  const fixtures = {
    entries: {
      command: {
        name: "test-command",
        kind: "command",
      } as CLIEntry,
      flag: {
        name: "test-flag",
        kind: "flag",
      } as CLIEntry,
      longName: {
        name: "very-long-name-for-testing",
        kind: "flag",
      } as CLIEntry,
    },
    tokens: {
      valid: "--valid-token",
      invalid: "",
      withSpaces: "invalid token",
      duplicate: "--duplicate",
    },
    presetKinds: {
      valid: ["command", "flag"],
      invalid: ["invalid-kind", "not-command", "unknown"],
    },
    args: {
      stringValue: "test-value",
      numberValue: 123,
      objectValue: { key: "value" },
      errorObject: new Error("Test error"),
    },
  }

  describe("Definition errors", () => {
    it("should return correct message for missing command name", () => {
      expect(defaultMessages.DEF_CMD_MISSING_NAME()).toBe("Command definition must include a 'name' property")
    })

    it("should return correct message for missing flag name", () => {
      expect(defaultMessages.DEF_FLAG_MISSING_NAME()).toBe("Flag definition must include a 'name' property")
    })
  })

  describe("Preset errors", () => {
    it("should return correct message for no presets provided", () => {
      expect(defaultMessages.PRESET_NONE_PROVIDED()).toBe("At least one preset must be provided to the use() method")
    })

    it("should return correct message for missing kind property", () => {
      expect(defaultMessages.PRESET_MISSING_KIND()).toBe(
        "Invalid preset provided: missing 'kind' property. Preset must have a 'kind' property of 'command' or 'flag'",
      )
    })

    it("should return correct message for missing name property", () => {
      expect(defaultMessages.PRESET_MISSING_NAME()).toBe(
        "Invalid preset provided: missing 'name' property. All presets must have a name",
      )
    })

    it.each(fixtures.presetKinds.invalid)("should return correct message for invalid kind: %s", (kind) => {
      expect(defaultMessages.PRESET_INVALID_KIND(kind)).toBe(
        `Invalid preset kind: "${kind}". Kind must be either "command" or "flag"`,
      )
    })
  })

  describe("Token errors", () => {
    it("should return correct message for invalid token", () => {
      const token = fixtures.tokens.invalid
      expect(defaultMessages.TOKEN_INVALID(token)).toBe(
        `Invalid token: "${token}". Check for typos or if this token is registered`,
      )
    })

    it("should return correct message for token not found", () => {
      const token = fixtures.tokens.valid
      expect(defaultMessages.TOKEN_NOT_FOUND(token)).toBe(
        `Unable to resolve token "${token}". This token is not registered`,
      )
    })

    it.each([
      {
        entry: fixtures.entries.command,
        token: fixtures.tokens.duplicate,
        expected: `Token "${fixtures.tokens.duplicate}" is already used in "${fixtures.entries.command.name}". Each token must be unique`,
      },
      {
        entry: fixtures.entries.flag,
        token: fixtures.tokens.duplicate,
        expected: `Token "${fixtures.tokens.duplicate}" is already used in "${fixtures.entries.flag.name}". Each token must be unique`,
      },
    ])("should return correct message for duplicate token: $entry.kind", ({ entry, token, expected }) => {
      expect(defaultMessages.TOKEN_DUPLICATE(entry, token)).toBe(expected)
    })

    it.each([
      {
        input: fixtures.tokens.invalid,
        expected: `Invalid token format: "${fixtures.tokens.invalid}". Tokens cannot be empty or include spaces`,
      },
      {
        input: fixtures.tokens.withSpaces,
        expected: `Invalid token format: "${fixtures.tokens.withSpaces}". Tokens cannot be empty or include spaces`,
      },
    ])("should return correct message for bad token format: '$input'", ({ input, expected }) => {
      expect(defaultMessages.TOKEN_BAD_FORMAT(input)).toBe(expected)
    })
  })

  describe("Context errors", () => {
    it("should return correct message for invalid context", () => {
      expect(defaultMessages.CTX_INVALID()).toBe(
        "Invalid context. This operation is not allowed in the current context",
      )
    })

    it.each([
      {
        entry: fixtures.entries.command,
        parent: fixtures.entries.flag,
        expected: `command "${fixtures.entries.command.name}" is not valid in this context. It can only be used with "${fixtures.entries.flag.name}"`,
      },
      {
        entry: fixtures.entries.flag,
        parent: fixtures.entries.command,
        expected: `flag "${fixtures.entries.flag.name}" is not valid in this context. It can only be used with "${fixtures.entries.command.name}"`,
      },
    ])(
      "should return correct message for invalid parent: $entry.kind in $parent.kind",
      ({ entry, parent, expected }) => {
        expect(defaultMessages.CTX_INVALID_PARENT(entry, parent)).toBe(expected)
      },
    )

    it.each([
      {
        entry: fixtures.entries.command,
        parent: fixtures.entries.flag,
        expected: `command "${fixtures.entries.command.name}" is not valid in this context. Check if the parent command is correctly defined`,
      },
      {
        entry: fixtures.entries.flag,
        parent: fixtures.entries.command,
        expected: `flag "${fixtures.entries.flag.name}" is not valid in this context. Check if the parent command is correctly defined`,
      },
    ])("should return correct message for wrong parent: $entry.kind in $parent.kind", ({ entry, parent, expected }) => {
      expect(defaultMessages.CTX_WRONG_PARENT(entry, parent)).toBe(expected)
    })
  })

  describe("Argument errors", () => {
    it("should return correct message for invalid argument", () => {
      const flag = "--unknown"
      expect(defaultMessages.ARG_INVALID(flag)).toBe(`Invalid argument "${flag}". This argument is not recognized`)
    })

    it.each([
      {
        entry: fixtures.entries.flag,
        error: "Test error",
        expected: `Error parsing "${fixtures.entries.flag.name}": Test error`,
      },
      {
        entry: fixtures.entries.flag,
        error: fixtures.args.errorObject,
        expected: `Error parsing "${fixtures.entries.flag.name}": Error: Test error`,
      },
    ])("should return correct message for parsing error: $error", ({ entry, error, expected }) => {
      expect(defaultMessages.ARG_PARSING_ERROR(entry, error)).toBe(expected)
    })

    it.each([{ entry: fixtures.entries.flag }, { entry: fixtures.entries.longName }])(
      "should return correct message for missing value: $entry.name",
      ({ entry }) => {
        expect(defaultMessages.ARG_MISSING_VALUE(entry)).toBe(
          `Missing value for "${entry.name}". This flag requires a value`,
        )
      },
    )

    it.each([
      {
        entry: fixtures.entries.flag,
        value: fixtures.args.stringValue,
        expected: `Invalid value "${fixtures.args.stringValue}" for "${fixtures.entries.flag.name}". Check the expected type and format`,
      },
      {
        entry: fixtures.entries.flag,
        value: fixtures.args.numberValue,
        expected: `Invalid value "${fixtures.args.numberValue}" for "${fixtures.entries.flag.name}". Check the expected type and format`,
      },
    ])("should return correct message for invalid value: $value", ({ entry, value, expected }) => {
      expect(defaultMessages.ARG_INVALID_VALUE(entry, value)).toBe(expected)
    })

    it.each([
      {
        entry: fixtures.entries.flag,
        type: "string",
        expected: `Invalid type "string" for "${fixtures.entries.flag.name}". Check the expected type in the documentation`,
      },
      {
        entry: fixtures.entries.flag,
        type: "number",
        expected: `Invalid type "number" for "${fixtures.entries.flag.name}". Check the expected type in the documentation`,
      },
    ])("should return correct message for invalid type: $type", ({ entry, type, expected }) => {
      expect(defaultMessages.ARG_INVALID_TYPE(entry, type)).toBe(expected)
    })
  })

  describe("Requirement errors", () => {
    it.each([
      {
        entry: fixtures.entries.flag,
        parent: fixtures.entries.command,
        expected: `flag "${fixtures.entries.flag.name}" is required when using "${fixtures.entries.command.name}"`,
      },
      {
        entry: fixtures.entries.command,
        parent: fixtures.entries.flag,
        expected: `command "${fixtures.entries.command.name}" is required when using "${fixtures.entries.flag.name}"`,
      },
    ])(
      "should return correct message for missing required flag: $entry.kind for $parent.kind",
      ({ entry, parent, expected }) => {
        expect(defaultMessages.REQ_FLAG_MISSING(entry, parent)).toBe(expected)
      },
    )
  })

  describe("CLI execution errors", () => {
    it("should return correct message for invalid CLI input", () => {
      expect(defaultMessages.CLI_INVALID_INPUT()).toBe("CLI input must be an array of strings")
    })

    it("should return correct message for help display failure", () => {
      const error = "Help display error"
      expect(defaultMessages.CLI_HELP_DISPLAY_FAILED(error)).toBe(`Failed to display help information: ${error}`)
    })

    it("should return correct message for no action found with default help", () => {
      expect(defaultMessages.CLI_NO_ACTION_FOUND()).toBe(
        "No command with an action was specified. Use --help to see available commands",
      )
    })

    it("should return correct message for no action found with command help", () => {
      expect(defaultMessages.CLI_NO_ACTION_FOUND("command", "assist")).toBe(
        "No command with an action was specified. Use assist to see available commands",
      )
    })

    it("should return correct message for no action found with custom flag help", () => {
      expect(defaultMessages.CLI_NO_ACTION_FOUND("flag", "assist")).toBe(
        "No command with an action was specified. Use --assist to see available commands",
      )
    })

    it.each([
      { error: "Command error", expected: "Error executing command: Command error" },
      { error: fixtures.args.errorObject, expected: "Error executing command: Error: Test error" },
    ])("should return correct message for action failure: $error", ({ error, expected }) => {
      expect(defaultMessages.CLI_ACTION_FAILED(error)).toBe(expected)
    })

    it.each([
      { error: "Input error", expected: "Failed to process CLI input: Input error" },
      { error: fixtures.args.errorObject, expected: "Failed to process CLI input: Error: Test error" },
    ])("should return correct message for input processing failure: $error", ({ error, expected }) => {
      expect(defaultMessages.CLI_INPUT_PROCESSING_FAILED(error)).toBe(expected)
    })
  })
})
