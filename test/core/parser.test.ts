import { beforeEach, describe, expect, it, vi } from "vitest"
import { CLIParser, CLIRegistry } from "../../src/core"
import { CLIError, CLIErrorHandler } from "../../src/errors"

describe("CLIParser", () => {
  // Test fixtures to reduce repetition
  const fixtures = {
    entries: {
      root: {
        index: 0,
        kind: "root" as const,
        name: "root",
        description: "Root command",
        parentIndex: null,
        tokens: null,
      },
      command: {
        index: 1,
        kind: "command" as const,
        name: "test-command",
        description: "A test command",
        parentIndex: 0,
        tokens: {
          match: (input: string) => input === "test-command",
          tokens: new Set(["test-command"]),
        },
      },
      subcommand: {
        index: 2,
        kind: "command" as const,
        name: "subcommand",
        description: "A sub command",
        parentIndex: 1,
        tokens: {
          match: (input: string) => input === "subcommand",
          tokens: new Set(["subcommand"]),
        },
      },
      flag: {
        index: 3,
        kind: "flag" as const,
        name: "flag",
        description: "A test flag",
        parentIndex: 0,
        tokens: {
          match: (input: string) => input === "--flag",
          tokens: new Set(["--flag"]),
        },
        parser: null,
      },
      flagWithValue: {
        index: 4,
        kind: "flag" as const,
        name: "value-flag",
        description: "A flag with value",
        parentIndex: 0,
        tokens: {
          match: (input: string) => input === "--value-flag",
          tokens: new Set(["--value-flag"]),
        },
        parser: (input: string) => ({ ok: true, value: input }),
      },
      flagWithDefault: {
        index: 5,
        kind: "flag" as const,
        name: "default-flag",
        description: "A flag with default",
        parentIndex: 0,
        tokens: {
          match: (input: string) => input === "--default-flag",
          tokens: new Set(["--default-flag"]),
        },
        default: "default-value",
      },
      requiredFlag: {
        index: 6,
        kind: "flag" as const,
        name: "required-flag",
        description: "A required flag",
        parentIndex: 0,
        tokens: {
          match: (input: string) => input === "--required-flag",
          tokens: new Set(["--required-flag"]),
        },
        required: true,
      },
    },
    inputs: {
      empty: [],
      command: ["test-command"],
      flag: ["--flag"],
      flagWithValue: ["--value-flag", "some-value"],
      multiple: ["test-command", "--flag", "--value-flag", "some-value"],
      invalid: ["unknown-token"],
      duplicates: ["test-command", "test-command"],
      commandWithSubcommand: ["test-command", "subcommand"],
      invalidContext: ["subcommand"],
    },
    errors: {
      tokenNotFound: "TOKEN_NOT_FOUND",
      tokenDuplicate: "TOKEN_DUPLICATE",
      ctxInvalid: "CTX_INVALID",
      ctxInvalidParent: "CTX_INVALID_PARENT",
      argMissingValue: "ARG_MISSING_VALUE",
      argInvalidValue: "ARG_INVALID_VALUE",
      argParsingError: "ARG_PARSING_ERROR",
      reqFlagMissing: "REQ_FLAG_MISSING",
    },
  }

  // Common test variables
  let registry: CLIRegistry
  let errorHandler: CLIErrorHandler
  let parser: CLIParser

  beforeEach(() => {
    // Create a mock registry
    registry = {
      nodes: [
        fixtures.entries.root,
        fixtures.entries.command,
        fixtures.entries.subcommand,
        fixtures.entries.flag,
        fixtures.entries.flagWithValue,
        fixtures.entries.flagWithDefault,
        fixtures.entries.requiredFlag,
      ],
      children: {
        0: [1, 3, 4, 5, 6],
        1: [2],
      },
      requires: {
        0: [],
      },
      withdefaults: new Set([5]),
      getEntry: vi.fn((index) => registry.nodes[Number(index)]),
      set: vi.fn(),
    } as unknown as CLIRegistry

    // Create a mock error handler
    errorHandler = {
      create: vi.fn((code) => {
        const error = new Error(`Error: ${code}`)
        error.name = "CLIError"
        return error as CLIError<any>
      }),
    } as unknown as CLIErrorHandler

    // Create parser instance for testing
    parser = new CLIParser(registry, errorHandler)
  })

  describe("constructor", () => {
    it("should initialize with the provided dependencies", () => {
      expect(parser.registry).toBe(registry)
      expect(parser.errorHandler).toBe(errorHandler)
    })

    it("should initialize expected entries from registry children[0]", () => {
      expect(parser.expected).toBeInstanceOf(Set)
      expect(Array.from(parser.expected)).toEqual([1, 3, 4, 5, 6])
    })

    it("should initialize other properties with empty values", () => {
      expect(parser.excluded).toBeInstanceOf(Set)
      expect(parser.current).toBeInstanceOf(Set)
      expect(parser.valueMap).toEqual({})
    })
  })

  describe("populateDefaults", () => {
    it("should add entries with defaults to current set", () => {
      const result = parser.populateDefaults()

      expect(result).toBe(parser) // Returns this for chaining
      expect(parser.current.has(5)).toBe(true) // The default flag entry
    })

    it("should not add entries without defaults", () => {
      const result = parser.populateDefaults()

      expect(parser.current.has(1)).toBe(false) // Command without default
      expect(parser.current.has(3)).toBe(false) // Flag without default
    })

    it("should not add entries that are already in current", () => {
      parser.current.add(5) // Add the default flag manually
      const spy = vi.spyOn(parser.current, "add")

      parser.populateDefaults()

      // Should not try to add it again
      expect(spy).not.toHaveBeenCalledWith(5)
    })
  })

  describe("enforceRequirements", () => {
    beforeEach(() => {
      // Setup requires for testing
      registry.requires = {
        1: [6], // Command requires required-flag
      }
    })

    it("should return this for chaining", () => {
      parser.current.add(6) // Add the required flag
      const result = parser.enforceRequirements()
      expect(result).toBe(parser)
    })

    it("should not throw when requirements are met", () => {
      parser.current.add(1) // Command that has requirements
      parser.current.add(6) // Required flag

      expect(() => parser.enforceRequirements()).not.toThrow()
    })

    it("should throw when requirements are not met", () => {
      parser.current.add(1) // Command that has requirements

      expect(() => parser.enforceRequirements()).toThrow()
      expect(errorHandler.create).toHaveBeenCalledWith(
        fixtures.errors.reqFlagMissing,
        expect.any(Object),
        expect.any(Object),
      )
    })

    it("should not check requirements for entries not in current set", () => {
      // Don't add command 1 to current
      expect(() => parser.enforceRequirements()).not.toThrow()
    })
  })

  describe("findEntry", () => {
    it.each([
      { token: "test-command", expectedIndex: 1 },
      { token: "--flag", expectedIndex: 3 },
      { token: "--value-flag", expectedIndex: 4 },
    ])("should find entry by token $token", ({ token, expectedIndex }) => {
      const entry = parser.findEntry(token)
      expect(entry).toBe(registry.nodes[expectedIndex])
    })

    it("should throw if token is not found", () => {
      expect(() => parser.findEntry("unknown-token")).toThrow()
      expect(errorHandler.create).toHaveBeenCalledWith(
        fixtures.errors.tokenNotFound,
        "unknown-token",
        expect.any(Array),
      )
    })
  })

  describe("validateEntry", () => {
    it("should not throw for valid entries", () => {
      expect(() => parser.validateEntry(fixtures.entries.command, "test-command")).not.toThrow()
    })

    it("should throw for duplicate entries", () => {
      parser.current.add(fixtures.entries.command.index)

      expect(() => parser.validateEntry(fixtures.entries.command, "test-command")).toThrow()
      expect(errorHandler.create).toHaveBeenCalledWith(
        fixtures.errors.tokenDuplicate,
        fixtures.entries.command,
        "test-command",
      )
    })

    it("should throw for entries not in the expected set", () => {
      parser.expected.clear() // Remove all expected entries

      expect(() => parser.validateEntry(fixtures.entries.command, "test-command")).toThrow()
      expect(errorHandler.create).toHaveBeenCalledWith(
        expect.stringContaining("CTX_INVALID"),
        expect.any(Object),
        expect.any(Object),
      )
    })

    it("should throw for commands when parent is excluded", () => {
      parser.excluded.add(fixtures.entries.command.parentIndex)

      expect(() => parser.validateEntry(fixtures.entries.command, "test-command")).toThrow()
      expect(errorHandler.create).toHaveBeenCalledWith(
        expect.stringContaining("CTX_INVALID"),
        expect.any(Object),
        expect.any(Object),
      )
    })

    it("should throw CTX_INVALID when entry is invalid and no parent exists", () => {
      // Clear expected entries to make the entry invalid
      parser.expected.clear()

      // Mock getEntry to return null to trigger the CTX_INVALID specific case
      vi.spyOn(registry, "getEntry").mockReturnValueOnce(null)

      expect(() => parser.validateEntry(fixtures.entries.command, "test-command")).toThrow()

      // Specifically check that CTX_INVALID was called, not CTX_INVALID_PARENT
      expect(errorHandler.create).toHaveBeenCalledWith(fixtures.errors.ctxInvalid)
    })
  })

  describe("updateState", () => {
    it("should add entry to current set", () => {
      parser.updateState(fixtures.entries.command)
      expect(parser.current.has(fixtures.entries.command.index)).toBe(true)
    })

    it("should remove entry from expected set", () => {
      parser.updateState(fixtures.entries.command)
      expect(parser.expected.has(fixtures.entries.command.index)).toBe(false)
    })

    it("should add parent to excluded for commands", () => {
      parser.updateState(fixtures.entries.command)
      expect(parser.excluded.has(fixtures.entries.command.parentIndex)).toBe(true)
    })

    it("should add children to expected for commands", () => {
      parser.updateState(fixtures.entries.command)
      expect(parser.expected.has(fixtures.entries.subcommand.index)).toBe(true)
    })

    it("should not add children for flags", () => {
      const expectedBefore = [...parser.expected]
      parser.updateState(fixtures.entries.flag)
      const expectedAfter = [...parser.expected]

      // Should only remove the flag itself from expected, not add any new entries
      expect(expectedAfter.length).toBe(expectedBefore.length - 1)
    })
  })

  describe("handleFlag", () => {
    it("should set boolean value for flags without parsers", async () => {
      const result = await parser.handleFlag(fixtures.entries.flag, ["--flag"], 0)

      expect(result).toBe(0) // Should return same index
      expect(registry.set).toHaveBeenCalledWith(fixtures.entries.flag.index, "value", true)
      expect(parser.valueMap[0]).toBe(fixtures.entries.flag.index)
    })

    it("should parse value for flags with parsers", async () => {
      const result = await parser.handleFlag(fixtures.entries.flagWithValue, ["--value-flag", "test-value"], 0)

      expect(result).toBe(1) // Should advance index to consume value
      expect(registry.set).toHaveBeenCalledWith(fixtures.entries.flagWithValue.index, "value", "test-value")
      expect(parser.valueMap[1]).toBe(fixtures.entries.flagWithValue.index)
    })

    it("should throw if value is missing for flags with parsers", async () => {
      await expect(parser.handleFlag(fixtures.entries.flagWithValue, ["--value-flag"], 0)).rejects.toThrow()

      expect(errorHandler.create).toHaveBeenCalledWith(fixtures.errors.argMissingValue, fixtures.entries.flagWithValue)
    })

    it("should throw if parser returns non-ok result", async () => {
      const entryWithBadParser = {
        ...fixtures.entries.flagWithValue,
        parser: () => ({ ok: false, value: null, error: "Invalid value" }),
      }

      await expect(parser.handleFlag(entryWithBadParser, ["--value-flag", "test-value"], 0)).rejects.toThrow()

      expect(errorHandler.create).toHaveBeenCalledWith(
        fixtures.errors.argInvalidValue,
        entryWithBadParser,
        "Invalid value",
      )
    })

    it("should propagate CLIError instances", async () => {
      const error = new CLIError("CUSTOM_ERROR", [], "Custom error")
      const entryWithErrorParser = {
        ...fixtures.entries.flagWithValue,
        parser: () => {
          throw error
        },
      }

      await expect(parser.handleFlag(entryWithErrorParser, ["--value-flag", "test-value"], 0)).rejects.toThrow(error)
    })

    it("should wrap other errors", async () => {
      const jsError = new Error("JavaScript error")
      const entryWithErrorParser = {
        ...fixtures.entries.flagWithValue,
        parser: () => {
          throw jsError
        },
      }

      await expect(parser.handleFlag(entryWithErrorParser, ["--value-flag", "test-value"], 0)).rejects.toThrow()

      expect(errorHandler.create).toHaveBeenCalledWith(fixtures.errors.argParsingError, entryWithErrorParser, jsError)
    })
  })

  describe("resolveTokens", () => {
    it("should return this for chaining", async () => {
      const result = await parser.resolveTokens([])
      expect(result).toBe(parser)
    })

    it("should process command tokens", async () => {
      const updateStateSpy = vi.spyOn(parser, "updateState")

      await parser.resolveTokens(["test-command"])

      expect(updateStateSpy).toHaveBeenCalledWith(fixtures.entries.command)
      expect(parser.current.has(fixtures.entries.command.index)).toBe(true)
    })

    it("should process flag tokens", async () => {
      const handleFlagSpy = vi.spyOn(parser, "handleFlag").mockResolvedValue(0)

      await parser.resolveTokens(["--flag"])

      expect(handleFlagSpy).toHaveBeenCalledWith(fixtures.entries.flag, ["--flag"], 0)
    })

    it("should skip indices in valueMap", async () => {
      parser.valueMap[0] = 999 // Mark index 0 as processed
      const findEntrySpy = vi.spyOn(parser, "findEntry")

      await parser.resolveTokens(["--flag"])

      expect(findEntrySpy).not.toHaveBeenCalled()
    })

    it("should process multiple tokens", async () => {
      const updateStateSpy = vi.spyOn(parser, "updateState")
      const handleFlagSpy = vi.spyOn(parser, "handleFlag").mockImplementation(async (entry, input, i) => {
        parser.valueMap[i] = entry.index
        return i
      })

      await parser.resolveTokens(["test-command", "--flag"])

      expect(updateStateSpy).toHaveBeenCalledTimes(2)
      expect(handleFlagSpy).toHaveBeenCalledTimes(1)
      expect(parser.current.has(fixtures.entries.command.index)).toBe(true)
      expect(parser.current.has(fixtures.entries.flag.index)).toBe(true)
    })

    it("should handle errors from findEntry", async () => {
      vi.spyOn(parser, "findEntry").mockImplementation(() => {
        throw new Error("Find entry error")
      })

      await expect(parser.resolveTokens(["test-command"])).rejects.toThrow("Find entry error")
    })

    it("should handle errors from validateEntry", async () => {
      vi.spyOn(parser, "validateEntry").mockImplementation(() => {
        throw new Error("Validate entry error")
      })

      await expect(parser.resolveTokens(["test-command"])).rejects.toThrow("Validate entry error")
    })

    it("should handle errors from handleFlag", async () => {
      vi.spyOn(parser, "handleFlag").mockRejectedValue(new Error("Handle flag error"))

      await expect(parser.resolveTokens(["--flag"])).rejects.toThrow("Handle flag error")
    })
  })

  describe("integration", () => {
    it("should process a sequence of commands and flags", async () => {
      // Mock the parser method to return a valid result
      const mockParser = vi.fn().mockReturnValue({ ok: true, value: "test-value" })
      registry.nodes[4] = { ...fixtures.entries.flagWithValue, parser: mockParser }

      await parser.resolveTokens(["test-command", "--flag", "--value-flag", "test-value"])

      // Check command was added
      expect(parser.current.has(fixtures.entries.command.index)).toBe(true)

      // Check flags were processed
      expect(registry.set).toHaveBeenCalledWith(fixtures.entries.flag.index, "value", true)
      expect(registry.set).toHaveBeenCalledWith(fixtures.entries.flagWithValue.index, "value", "test-value")

      // Check valueMap was updated
      expect(parser.valueMap[1]).toBe(fixtures.entries.flag.index)
      expect(parser.valueMap[3]).toBe(fixtures.entries.flagWithValue.index)
    })

    it("should process the full parser workflow correctly", async () => {
      // Mock the parser method to return a valid result
      const mockParser = vi.fn().mockReturnValue({ ok: true, value: "test-value" })
      registry.nodes[4] = { ...fixtures.entries.flagWithValue, parser: mockParser }

      // Track method calls
      const resolveTokensSpy = vi.spyOn(parser, "resolveTokens")
      const populateDefaultsSpy = vi.spyOn(parser, "populateDefaults")
      const enforceRequirementsSpy = vi.spyOn(parser, "enforceRequirements")

      const parsed = await parser.resolveTokens(["test-command", "--value-flag", "test-value"])

      parsed.populateDefaults().enforceRequirements()

      // Check that all methods were called
      expect(resolveTokensSpy).toHaveBeenCalled()
      expect(populateDefaultsSpy).toHaveBeenCalled()
      expect(enforceRequirementsSpy).toHaveBeenCalled()

      // Check final state
      expect(parser.current.has(fixtures.entries.command.index)).toBe(true)
      expect(parser.current.has(fixtures.entries.flagWithValue.index)).toBe(true)
      expect(parser.current.has(fixtures.entries.flagWithDefault.index)).toBe(true)
    })

    it("should handle nested command chains correctly", async () => {
      await parser.resolveTokens(["test-command", "subcommand"])

      // Command and subcommand should be in current set
      expect(parser.current.has(fixtures.entries.command.index)).toBe(true)
      expect(parser.current.has(fixtures.entries.subcommand.index)).toBe(true)

      // Parent command should be excluded after its subcommand is used
      expect(parser.excluded.has(fixtures.entries.command.parentIndex)).toBe(true)
    })

    it("should process mixed commands and flags in expected order", async () => {
      const executionOrder: string[] = []

      // Track execution order
      vi.spyOn(parser, "updateState").mockImplementation((entry) => {
        executionOrder.push(entry.name)
        // Original implementation
        const isCmd = entry.kind === "command"
        parser.current.add(entry.index)
        parser.expected.delete(entry.index)

        if (isCmd) {
          for (const child of registry.children[entry.index] || []) {
            parser.expected.add(child)
          }
          parser.excluded.add(entry.parentIndex)
        }
      })

      await parser.resolveTokens(["test-command", "--flag", "--value-flag", "test-value"])

      // Verify execution order
      expect(executionOrder).toEqual(["test-command", "flag", "value-flag"])
    })
  })

  describe("error handling", () => {
    it("should throw TOKEN_NOT_FOUND with unknown tokens", async () => {
      await expect(parser.resolveTokens(["unknown-command"])).rejects.toThrow()
      expect(errorHandler.create).toHaveBeenCalledWith(
        fixtures.errors.tokenNotFound,
        "unknown-command",
        expect.any(Array),
      )
    })

    it("should throw TOKEN_DUPLICATE for repeated tokens", async () => {
      await expect(parser.resolveTokens(["test-command", "test-command"])).rejects.toThrow()
      expect(errorHandler.create).toHaveBeenCalledWith(
        fixtures.errors.tokenDuplicate,
        expect.any(Object),
        "test-command",
      )
    })

    it("should throw CTX_INVALID for commands out of context", async () => {
      // Subcommand without parent command first
      await expect(parser.resolveTokens(["subcommand"])).rejects.toThrow()
      expect(errorHandler.create).toHaveBeenCalledWith(
        expect.stringContaining("CTX_INVALID"),
        expect.any(Object),
        expect.any(Object),
      )
    })

    it("should throw REQ_FLAG_MISSING when requirements aren't met", async () => {
      // Setup requires for testing
      registry.requires = {
        1: [6], // Command requires required-flag
      }

      // Process command without required flag
      await parser.resolveTokens(["test-command"])

      // When enforcing requirements, should fail
      expect(() => parser.enforceRequirements()).toThrow()
      expect(errorHandler.create).toHaveBeenCalledWith(
        fixtures.errors.reqFlagMissing,
        expect.any(Object),
        expect.any(Object),
      )
    })
  })

  describe("edge cases", () => {
    it("should handle empty input array", async () => {
      await parser.resolveTokens([])
      expect(parser.current.size).toBe(0)
    })

    it("should properly handle flags at the end of input", async () => {
      const result = await parser.handleFlag(fixtures.entries.flag, ["--flag"], 0)
      expect(result).toBe(0) // Should return same index for flags without values
    })

    it("should properly chain parser methods in different orders", async () => {
      // Add directly to current to avoid mock conflicts
      parser.current.add(fixtures.entries.command.index)
      parser.current.add(fixtures.entries.flagWithDefault.index)

      // Chain in different order
      await parser.enforceRequirements().populateDefaults().resolveTokens(["--flag"])

      // Should have all entries
      expect(parser.current.has(fixtures.entries.command.index)).toBe(true)
      expect(parser.current.has(fixtures.entries.flagWithDefault.index)).toBe(true)
      expect(parser.current.has(fixtures.entries.flag.index)).toBe(true)
    })

    it("should handle async parser functions correctly", async () => {
      const asyncParser = vi.fn().mockImplementation(async (input: string) => {
        // Simulate async processing
        await new Promise((resolve) => setTimeout(resolve, 10))
        return { ok: true, value: `processed-${input}` }
      })

      // Create entry with async parser
      const asyncEntry = {
        ...fixtures.entries.flagWithValue,
        parser: asyncParser,
      }

      const result = await parser.handleFlag(asyncEntry, ["--value-flag", "test-value"], 0)

      expect(result).toBe(1)
      expect(registry.set).toHaveBeenCalledWith(asyncEntry.index, "value", "processed-test-value")
    })
  })
})
