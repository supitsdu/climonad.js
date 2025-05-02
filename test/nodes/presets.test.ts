import { describe, expect, it } from "vitest"
import { bool, cmd, num, ParsingNull, ParsingOK, str } from "../../src/nodes"

describe("CLI Preset Functions", () => {
  // Test fixtures to reduce repetition
  const fixtures = {
    configs: {
      basic: {
        name: "test-option",
        description: "Test option description",
      },
      withAliases: {
        name: "verbose",
        description: "Enable verbose mode",
        aliases: ["v", "vv"],
      },
      withPrefixes: {
        name: "output",
        description: "Output file path",
        prefixes: {
          main: "--",
          alias: "-",
        },
      },
      complete: {
        name: "format",
        description: "Output format",
        aliases: ["f", "fmt"],
        prefixes: {
          main: "--",
          alias: "-",
        },
        required: true,
        default: "json",
      },
    },
    inputs: {
      numbers: {
        valid: ["42", "3.14", "0", "-10"],
        invalid: ["abc", "", "42abc", "true"],
      },
      strings: {
        valid: ["hello", "world", "42", "true"],
        empty: ["", null, undefined],
      },
    },
  }

  describe("cmd", () => {
    it.each([
      { name: "basic config", config: fixtures.configs.basic },
      { name: "with aliases", config: fixtures.configs.withAliases },
      { name: "with prefixes", config: fixtures.configs.withPrefixes },
      { name: "complete config", config: fixtures.configs.complete },
    ])("should create a command preset with $name", ({ config }) => {
      const result = cmd(config)

      // Check preset structure
      expect(result).toEqual({
        ...config,
        kind: "command",
        parser: null,
      })

      // Verify specific properties
      expect(result.kind).toBe("command")
      expect(result.parser).toBeNull()
      expect(result.name).toBe(config.name)
      expect(result.description).toBe(config.description)
    })
  })

  describe("num", () => {
    it.each([
      { name: "basic config", config: fixtures.configs.basic },
      { name: "complete config", config: fixtures.configs.complete },
    ])("should create a flag preset with $name", ({ config }) => {
      const result = num(config)

      // Check preset structure
      expect(result).toEqual({
        ...config,
        kind: "flag",
        parser: expect.any(Function),
      })

      // Verify specific properties
      expect(result.kind).toBe("flag")
      expect(result.parser).toBeInstanceOf(Function)
    })

    it.each(fixtures.inputs.numbers.valid)("should parse valid number '%s'", async (input) => {
      const result = num(fixtures.configs.basic)
      const parsed = await result.parser!(input)

      expect(parsed).toBeInstanceOf(ParsingOK)
      expect(parsed.ok).toBe(true)
      expect(parsed.value).toBe(Number(input))
    })

    it.each(fixtures.inputs.numbers.invalid)("should reject invalid number '%s'", async (input) => {
      const result = num(fixtures.configs.basic)
      const parsed = await result.parser!(input)

      expect(parsed).toBeInstanceOf(ParsingNull)
      expect(parsed.ok).toBe(false)
      expect(parsed.value).toBeNull()
    })
  })

  describe("bool", () => {
    it.each([
      { name: "basic config", config: fixtures.configs.basic },
      { name: "with aliases", config: fixtures.configs.withAliases },
      { name: "complete config", config: fixtures.configs.complete },
    ])("should create a boolean flag preset with $name", ({ config }) => {
      const result = bool(config)

      // Check preset structure
      expect(result).toEqual({
        ...config,
        kind: "flag",
        parser: null,
      })

      // Verify specific properties
      expect(result.kind).toBe("flag")
      expect(result.parser).toBeNull()
      expect(result.name).toBe(config.name)
    })
  })

  describe("str", () => {
    it.each([
      { name: "basic config", config: fixtures.configs.basic },
      { name: "with prefixes", config: fixtures.configs.withPrefixes },
    ])("should create a string flag preset with $name", ({ config }) => {
      const result = str(config)

      // Check preset structure
      expect(result).toEqual({
        ...config,
        kind: "flag",
        parser: expect.any(Function),
      })

      // Verify specific properties
      expect(result.kind).toBe("flag")
      expect(result.parser).toBeInstanceOf(Function)
    })

    it.each(fixtures.inputs.strings.valid)("should parse non-empty string '%s'", async (input) => {
      const result = str(fixtures.configs.basic)
      const parsed = await result.parser!(input)

      expect(parsed).toBeInstanceOf(ParsingOK)
      expect(parsed.ok).toBe(true)
      expect(parsed.value).toBe(input)
    })

    it.each(fixtures.inputs.strings.empty)("should reject empty string %s", async (input) => {
      const result = str(fixtures.configs.basic)
      const parsed = await result.parser!(input as any)

      expect(parsed).toBeInstanceOf(ParsingNull)
      expect(parsed.ok).toBe(false)
      expect(parsed.value).toBe(input)
    })
  })
})
