import { beforeEach, describe, expect, it, vi } from "vitest"
import { CLITokens, isString } from "../../src/core"
import { CLIErrorHandler } from "../../src/errors"

describe("CLITokens", () => {
  // Test fixtures to reduce repetition
  const fixtures = {
    options: {
      basic: {
        name: "test-command",
      },
      withAliases: {
        name: "verbose",
        aliases: ["v", "vv"],
      },
      withPrefixes: {
        name: "help",
        prefixes: {
          main: "--",
          alias: "-",
        },
      },
      withPrefixesAndAliases: {
        name: "output",
        aliases: ["o", "out"],
        prefixes: {
          main: "--",
          alias: "-",
        },
      },
    },
    badInputs: {
      empty: "",
      withSpaces: "test command",
      nullValue: null as any,
      undefinedValue: undefined as any,
    },
  }

  let errorHandler: CLIErrorHandler

  beforeEach(() => {
    errorHandler = new CLIErrorHandler()
    vi.spyOn(errorHandler, "create")
  })

  describe("isString", () => {
    it.each([
      { input: "test", expected: true },
      { input: "", expected: false },
      { input: "   ", expected: false },
      { input: null, expected: false },
      { input: undefined, expected: false },
      { input: 123, expected: false },
      { input: {}, expected: false },
      { input: [], expected: false },
    ])("should correctly identify if $input is a valid string", ({ input, expected }) => {
      expect(isString(input)).toBe(expected)
    })
  })

  describe("constructor", () => {
    it("should create tokens from a basic name", () => {
      const tokens = new CLITokens(fixtures.options.basic, errorHandler)

      expect(tokens.tokens.size).toBe(1)
      expect(tokens.tokens.has("test-command")).toBe(true)
    })

    it("should create tokens with aliases", () => {
      const tokens = new CLITokens(fixtures.options.withAliases, errorHandler)

      expect(tokens.tokens.size).toBe(3)
      expect(tokens.tokens.has("verbose")).toBe(true)
      expect(tokens.tokens.has("v")).toBe(true)
      expect(tokens.tokens.has("vv")).toBe(true)
    })

    it("should create tokens with prefixes", () => {
      const tokens = new CLITokens(fixtures.options.withPrefixes, errorHandler)

      expect(tokens.tokens.size).toBe(1)
      expect(tokens.tokens.has("--help")).toBe(true)
    })

    it("should create tokens with prefixes and aliases", () => {
      const tokens = new CLITokens(fixtures.options.withPrefixesAndAliases, errorHandler)

      expect(tokens.tokens.size).toBe(3)
      expect(tokens.tokens.has("--output")).toBe(true)
      expect(tokens.tokens.has("-o")).toBe(true)
      expect(tokens.tokens.has("-out")).toBe(true)
    })

    it("should handle empty prefixes gracefully", () => {
      const tokens = new CLITokens(
        {
          name: "test",
          prefixes: {},
        },
        errorHandler,
      )

      expect(tokens.tokens.size).toBe(1)
      expect(tokens.tokens.has("test")).toBe(true)
    })

    it("should handle empty aliases array gracefully", () => {
      const tokens = new CLITokens(
        {
          name: "test",
          aliases: [],
        },
        errorHandler,
      )

      expect(tokens.tokens.size).toBe(1)
      expect(tokens.tokens.has("test")).toBe(true)
    })
  })

  describe("join", () => {
    it("should join prefix and input correctly", () => {
      expect(CLITokens.join("--", "help", errorHandler)).toBe("--help")
    })

    it("should work with empty prefix", () => {
      expect(CLITokens.join("", "help", errorHandler)).toBe("help")
    })

    it.each([fixtures.badInputs.empty, fixtures.badInputs.withSpaces])(
      "should throw for invalid input: %s",
      (input) => {
        expect(() => CLITokens.join("--", input, errorHandler)).toThrow()
        expect(errorHandler.create).toHaveBeenCalledWith("TOKEN_BAD_FORMAT", input)
      },
    )

    it.each([fixtures.badInputs.nullValue, fixtures.badInputs.undefinedValue])(
      "should throw for non-string input: %s",
      (input) => {
        expect(() => CLITokens.join("--", input, errorHandler)).toThrow()
        expect(errorHandler.create).toHaveBeenCalledWith("TOKEN_BAD_FORMAT", input)
      },
    )
  })

  describe("match", () => {
    it("should match exact tokens", () => {
      const tokens = new CLITokens(fixtures.options.withPrefixesAndAliases, errorHandler)

      expect(tokens.match("--output")).toBe(true)
      expect(tokens.match("-o")).toBe(true)
      expect(tokens.match("-out")).toBe(true)
    })

    it("should not match non-existing tokens", () => {
      const tokens = new CLITokens(fixtures.options.withPrefixesAndAliases, errorHandler)

      expect(tokens.match("output")).toBe(false)
      expect(tokens.match("--o")).toBe(false)
      expect(tokens.match("--out")).toBe(false)
    })

    it("should be case-sensitive", () => {
      const tokens = new CLITokens({ name: "test" }, errorHandler)

      expect(tokens.match("test")).toBe(true)
      expect(tokens.match("Test")).toBe(false)
    })
  })

  describe("complex scenarios", () => {
    it("should handle multiple aliases with different prefixes", () => {
      const tokens = new CLITokens(
        {
          name: "version",
          aliases: ["v", "ver"],
          prefixes: {
            main: "--",
            alias: "-",
          },
        },
        errorHandler,
      )

      expect(tokens.tokens.size).toBe(3)
      expect(tokens.match("--version")).toBe(true)
      expect(tokens.match("-v")).toBe(true)
      expect(tokens.match("-ver")).toBe(true)
      expect(tokens.match("version")).toBe(false)
    })

    it("should handle edge cases with special characters", () => {
      const tokens = new CLITokens(
        {
          name: "special-name",
          aliases: ["s-n", "123"],
          prefixes: {
            main: "--",
            alias: "-",
          },
        },
        errorHandler,
      )

      expect(tokens.tokens.size).toBe(3)
      expect(tokens.match("--special-name")).toBe(true)
      expect(tokens.match("-s-n")).toBe(true)
      expect(tokens.match("-123")).toBe(true)
    })
  })
})
