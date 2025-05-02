import { beforeEach, describe, expect, it, vi } from "vitest"
import { CLIRegistry, CLITokens } from "../../src/core"
import { CLIErrorHandler } from "../../src/errors"
import { CLINode, ParsingNull, ParsingOK } from "../../src/nodes"

// Mock CLITokens
vi.mock("../../src/core/tokens", () => ({
  CLITokens: vi.fn().mockImplementation(() => ({
    match: vi.fn(),
    tokens: new Set(["test"]),
  })),
}))

describe("CLINode", () => {
  // Test fixtures to reduce repetition
  const fixtures = {
    definitions: {
      basicCommand: {
        name: "test-command",
        description: "A test command",
      },
      basicFlag: {
        name: "test-flag",
        description: "A test flag",
      },
      invalidNoDef: null as any,
      invalidNoName: {
        description: "Missing name",
      } as any,
    },
    presets: {
      flagPreset: {
        kind: "flag" as const,
        name: "preset-flag",
        description: "A preset flag",
        parser: null,
      },
      commandPreset: {
        kind: "command" as const,
        name: "preset-command",
        description: "A preset command",
        parser: null,
      },
      invalidPreset: {
        name: "invalid-preset",
        description: "An invalid preset",
      } as any,
      invalidKindPreset: {
        kind: "invalid" as any,
        name: "invalid-kind-preset",
        description: "A preset with invalid kind",
      },
    },
    parsingValues: {
      stringValue: "test-value",
      numberValue: 42,
      objectValue: { key: "value" },
    },
  }

  // Common test variables
  let registry: CLIRegistry
  let errorHandler: CLIErrorHandler
  let node: CLINode

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Create mocks with spies
    registry = {
      register: vi.fn().mockReturnValue(1),
      nodes: [],
      children: {},
      requires: {},
      withdefaults: new Set(),
      initialize: vi.fn(),
      getEntry: vi.fn(),
      addRequirement: vi.fn(),
      addDependency: vi.fn(),
      set: vi.fn(),
    } as unknown as CLIRegistry

    errorHandler = {
      create: vi.fn((code) => new Error(`Error: ${code}`)),
    } as unknown as CLIErrorHandler

    // Create test node
    node = new CLINode(registry, null, errorHandler)
  })

  describe("constructor", () => {
    it("should initialize with the provided dependencies", () => {
      expect(node.registry).toBe(registry)
      expect(node.parentIndex).toBeNull()
      expect(node.errorHandler).toBe(errorHandler)
    })

    it("should accept a parent index when provided", () => {
      const nodeWithParent = new CLINode(registry, 5, errorHandler)
      expect(nodeWithParent.parentIndex).toBe(5)
    })
  })

  describe("cmd", () => {
    it("should register a command and return a new CLINode instance", () => {
      const result = node.cmd(fixtures.definitions.basicCommand)

      expect(registry.register).toHaveBeenCalledWith({
        ...fixtures.definitions.basicCommand,
        kind: "command",
        parentIndex: null,
        tokens: expect.any(Object),
      })
      expect(result).toBeInstanceOf(CLINode)
      expect(result).not.toBe(node) // Should be a new instance
      expect(CLITokens).toHaveBeenCalledWith(fixtures.definitions.basicCommand, errorHandler)
    })

    it.each([
      { name: "null definition", def: fixtures.definitions.invalidNoDef, expectedError: "DEF_CMD_MISSING_NAME" },
      { name: "missing name", def: fixtures.definitions.invalidNoName, expectedError: "DEF_CMD_MISSING_NAME" },
    ])("should throw an error for $name", ({ def, expectedError }) => {
      expect(() => node.cmd(def)).toThrow(expectedError)
      expect(errorHandler.create).toHaveBeenCalledWith(expectedError)
    })
  })

  describe("flag", () => {
    it("should register a flag and return the same CLINode instance", () => {
      const result = node.flag(fixtures.definitions.basicFlag)

      expect(registry.register).toHaveBeenCalledWith({
        ...fixtures.definitions.basicFlag,
        kind: "flag",
        parentIndex: null,
        tokens: expect.any(Object),
      })
      expect(result).toBe(node) // Should be the same instance
      expect(CLITokens).toHaveBeenCalledWith(
        expect.objectContaining({
          ...fixtures.definitions.basicFlag,
          prefixes: expect.any(Object),
        }),
        errorHandler,
      )
    })

    it.each([
      { name: "null definition", def: fixtures.definitions.invalidNoDef, expectedError: "DEF_FLAG_MISSING_NAME" },
      { name: "missing name", def: fixtures.definitions.invalidNoName, expectedError: "DEF_FLAG_MISSING_NAME" },
    ])("should throw an error for $name", ({ def, expectedError }) => {
      expect(() => node.flag(def)).toThrow(expectedError)
      expect(errorHandler.create).toHaveBeenCalledWith(expectedError)
    })
  })

  describe("use", () => {
    it("should process multiple presets correctly", () => {
      // Spy on the methods
      const cmdSpy = vi.spyOn(node, "cmd").mockReturnValue(node)
      const flagSpy = vi.spyOn(node, "flag").mockReturnValue(node)

      const result = node.use(fixtures.presets.flagPreset, fixtures.presets.commandPreset)

      expect(flagSpy).toHaveBeenCalledWith(fixtures.presets.flagPreset)
      expect(cmdSpy).toHaveBeenCalledWith(fixtures.presets.commandPreset)
      expect(result).toBe(node)
    })

    it("should throw error when no presets are provided", () => {
      expect(() => node.use()).toThrow("PRESET_NONE_PROVIDED")
      expect(errorHandler.create).toHaveBeenCalledWith("PRESET_NONE_PROVIDED")
    })

    it("should throw error for invalid preset (missing kind)", () => {
      expect(() => node.use(fixtures.presets.invalidPreset)).toThrow("PRESET_MISSING_KIND")
      expect(errorHandler.create).toHaveBeenCalledWith("PRESET_MISSING_KIND")
    })

    it("should throw error for invalid kind", () => {
      // @ts-expect-error kind is invalid
      expect(() => node.use(fixtures.presets.invalidKindPreset)).toThrow("PRESET_INVALID_KIND")
      expect(errorHandler.create).toHaveBeenCalledWith("PRESET_INVALID_KIND", "invalid")
    })
  })

  describe("static methods", () => {
    it.each([
      { name: "string value", value: fixtures.parsingValues.stringValue },
      { name: "number value", value: fixtures.parsingValues.numberValue },
      { name: "object value", value: fixtures.parsingValues.objectValue },
    ])("Ok() should create a ParsingOK instance with $name", ({ value }) => {
      const result = CLINode.Ok(value)

      expect(result).toBeInstanceOf(ParsingOK)
      expect(result.ok).toBe(true)
      expect(result.value).toBe(value)
    })

    it.each([
      { name: "string value", value: fixtures.parsingValues.stringValue },
      { name: "number value", value: fixtures.parsingValues.numberValue },
      { name: "object value", value: fixtures.parsingValues.objectValue },
    ])("Error() should create a ParsingNull instance with $name", ({ value }) => {
      const result = CLINode.Error(value)

      expect(result).toBeInstanceOf(ParsingNull)
      expect(result.ok).toBe(false)
      expect(result.value).toBe(value)
    })
  })

  describe("defaultFlagDefinition", () => {
    it("should have the expected default values", () => {
      expect(CLINode.defaultFlagDefinition).toEqual({
        name: "",
        description: "",
        prefixes: {
          alias: "-",
          main: "--",
        },
      })
    })
  })
})

describe("ParsingOK", () => {
  it.each([
    { name: "string value", value: "test-value" },
    { name: "number value", value: 42 },
    { name: "object value", value: { key: "value" } },
  ])("should correctly initialize with $name", ({ value }) => {
    const result = new ParsingOK(value)

    expect(result.value).toBe(value)
    expect(result.ok).toBe(true)
  })
})

describe("ParsingNull", () => {
  it.each([
    { name: "string value", value: "test-value" },
    { name: "number value", value: 42 },
    { name: "object value", value: { key: "value" } },
  ])("should correctly initialize with $name and set ok=false", ({ value }) => {
    const result = new ParsingNull(value)

    expect(result.value).toBe(value)
    expect(result.ok).toBe(false)
  })
})
