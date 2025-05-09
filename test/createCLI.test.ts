import { describe, it, expect, vi, beforeEach } from "vitest"
import { createCLI, CLI } from "../src/createCLI"
import { CLIRegistry, CLIParser, CLITokens } from "../src/core"
import { CLIError, CLIErrorHandler } from "../src/errors"
import { CLIHelpConstructor } from "../src/ui"
import { CLIHelp, createCLIHelp } from "../src/ui/help"

// Mock dependencies
vi.mock("../src/core", () => ({
  CLIRegistry: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
    nodes: [],
    register: vi.fn().mockReturnValue(0), // Return a fake index for registered items
    children: { 0: [] },
  })),
  CLIParser: vi.fn().mockImplementation(() => ({
    resolveTokens: vi.fn().mockResolvedValue({
      populateDefaults: vi.fn().mockReturnThis(),
      enforceRequirements: vi.fn().mockReturnThis(),
      current: [],
    }),
  })),
  CLITokens: vi.fn().mockImplementation((options) => ({
    tokens: new Set([options?.name]),
    match: vi.fn((input) => input === options?.name),
  })),
}))

vi.mock("../src/errors", () => ({
  CLIError: class CLIError extends Error {
    constructor(message: string) {
      super(message)
      this.name = "CLIError"
    }
  },
  CLIErrorHandler: vi.fn().mockImplementation(() => ({
    create: vi.fn((code, details) => new Error(`${code}: ${details || ""}`)),
  })),
}))

vi.mock("../src/ui", () => ({
  CLIHelpConstructor: vi.fn().mockImplementation(() => ({})),
  CLIHelp: vi.fn().mockImplementation((reporter, def, kind) => ({
    reporter,
    def,
    kind: kind || "flag",
  })),
  createCLIHelp: vi.fn().mockImplementation((reporter, options) => ({
    reporter,
    def: { name: options?.name || "help", description: options?.description || "Help description" },
    kind: options?.kind || "flag",
  })),
}))

describe("createCLI", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Create a mock help reporter function
  const mockHelpReporter = vi.fn()

  // Fixtures for testing CLI creation
  const createCliFixtures = [
    {
      name: "basic options",
      options: { name: "test-cli", description: "A test CLI" },
      expected: { instanceof: CLI },
    },
    {
      name: "with CLIHelp object",
      options: {
        name: "test-cli",
        description: "A test CLI",
        help: new CLIHelp(mockHelpReporter, { name: "help", description: "Help description" }),
      },
      expected: { instanceof: CLI },
    },
    {
      name: "with custom error handler",
      options: {
        name: "test-cli",
        description: "A test CLI",
        errorHandler: new CLIErrorHandler(),
      },
      expected: { instanceof: CLI },
    },
  ]

  describe("createCLI function", () => {
    it.each(createCliFixtures)("should create CLI with $name", ({ options, expected }) => {
      const cli = createCLI(options)
      expect(cli).toBeInstanceOf(expected.instanceof)
    })

    it("should return the same instance when passed an existing CLI", () => {
      const mockRegistry = new CLIRegistry()
      const existingCli = new CLI({
        name: "existing",
        description: "Existing CLI",
        registry: mockRegistry,
      })

      const result = createCLI(existingCli)
      expect(result).toBe(existingCli)
    })
  })

  describe("CLI class", () => {
    // Fixtures for testing parse method
    const parseFixtures = [
      {
        name: "empty input",
        input: [],
        mockNodes: [],
        mockIndices: [],
        expected: {
          flags: new Map(),
          actions: [],
          help: null,
        },
      },
      {
        name: "command with action",
        input: ["command"],
        mockNodes: [{ index: 0, name: "command", kind: "command", action: vi.fn() }],
        mockIndices: [0],
        expected: {
          flags: new Map(),
          actions: [expect.any(Function)],
          help: null,
        },
      },
      {
        name: "command with flag",
        input: ["command", "--flag", "value"],
        mockNodes: [
          { index: 0, name: "command", kind: "command", action: vi.fn() },
          { index: 1, name: "flag", kind: "flag", value: "value" },
        ],
        mockIndices: [0, 1],
        expected: {
          flags: new Map([["flag", "value"]]),
          actions: [expect.any(Function)],
          help: null,
        },
      },
      {
        name: "help request",
        input: ["help"],
        mockNodes: [{ index: 0, name: "help", kind: "command", value: true }],
        mockIndices: [0],
        expected: {
          flags: new Map(),
          actions: [],
          help: expect.any(Object),
        },
      },
      {
        name: "command with default flag value",
        input: ["command"],
        mockNodes: [
          { index: 0, name: "command", kind: "command", action: vi.fn() },
          { index: 1, name: "flag", kind: "flag", default: "default-value" },
        ],
        mockIndices: [0, 1],
        expected: {
          flags: new Map([["flag", "default-value"]]),
          actions: [expect.any(Function)],
          help: null,
        },
      },
    ]

    describe("parse method", () => {
      it.each(parseFixtures)("should parse $name", async ({ input, mockNodes, mockIndices, expected }) => {
        // Setup mocks
        const mockRegistry = {
          initialize: vi.fn(),
          nodes: mockNodes,
          register: vi.fn().mockReturnValue(0),
          children: { 0: [] },
        }

        const mockParser = {
          resolveTokens: vi.fn().mockResolvedValue({
            populateDefaults: vi.fn().mockReturnThis(),
            enforceRequirements: vi.fn().mockReturnThis(),
            current: mockIndices,
          }),
        }

        vi.mocked(CLIRegistry).mockImplementation(() => mockRegistry as any)
        vi.mocked(CLIParser).mockImplementation(() => mockParser as any)

        // Create a mock help object
        const mockHelp = new CLIHelp(mockHelpReporter, { name: "help", description: "Help description" })

        const cli = new CLI({
          name: "test-cli",
          description: "Test CLI",
          registry: mockRegistry as any,
          help: mockHelp,
        })

        const result = await cli.parse(input)

        if (expected.flags.size > 0) {
          expected.flags.forEach((value, key) => {
            expect(result.flags.has(key)).toBe(true)
            expect(result.flags.get(key)).toBe(value)
          })
        } else {
          expect(result.flags.size).toBe(0)
        }

        expect(result.actions.length).toBe(expected.actions.length)

        if (expected.help === null) {
          expect(result.help).toBeNull()
        } else {
          expect(result.help).not.toBeNull()
        }
      })
    })

    // Fixtures for testing run method
    const runFixtures = [
      {
        name: "invalid input type",
        input: "not-an-array" as any,
        mockParse: null,
        shouldThrow: true,
        errorCode: "CLI_INVALID_INPUT",
      },
      {
        name: "no actions found",
        input: [],
        mockParse: { flags: new Map(), actions: [], help: null },
        shouldThrow: true,
        errorCode: "CLI_NO_ACTION_FOUND",
      },
      {
        name: "help requested",
        input: ["help"],
        mockParse: {
          flags: new Map(),
          actions: [],
          help: {} as CLIHelpConstructor,
        },
        mockHelpReporter: vi.fn().mockResolvedValue(undefined),
        shouldThrow: false,
      },
      {
        name: "failed help reporter",
        input: ["help"],
        mockParse: {
          flags: new Map(),
          actions: [],
          help: {} as CLIHelpConstructor,
        },
        mockHelpReporter: vi.fn().mockImplementation(() => {
          throw new Error("Help display failed")
        }),
        shouldThrow: true,
        errorCode: "CLI_HELP_DISPLAY_FAILED",
      },
      {
        name: "successful action execution",
        input: ["command"],
        mockParse: {
          flags: new Map([["flag", "value"]]),
          actions: [vi.fn()],
          help: null,
        },
        shouldThrow: false,
      },
      {
        name: "failed action execution",
        input: ["command"],
        mockParse: {
          flags: new Map(),
          actions: [
            vi.fn().mockImplementation(() => {
              throw new Error("Action failed")
            }),
          ],
          help: null,
        },
        shouldThrow: true,
        errorCode: "CLI_ACTION_FAILED",
      },
    ]

    describe("run method", () => {
      it.each(runFixtures)(
        "should handle $name",
        async ({ input, mockParse, mockHelpReporter, shouldThrow, errorCode }) => {
          // Create a proper help instance with the reporter
          const helpInstance = mockHelpReporter
            ? new CLIHelp(mockHelpReporter, { name: "help", description: "Help description" })
            : null

          const cli = new CLI({
            name: "test-cli",
            description: "Test CLI",
            registry: new CLIRegistry(),
            help: helpInstance as CLIHelp | undefined,
          })

          if (mockParse) {
            cli.parse = vi.fn().mockResolvedValue(mockParse)
          }

          if (shouldThrow) {
            await expect(cli.run(input)).rejects.toThrow(errorCode)
          } else {
            await expect(cli.run(input)).resolves.not.toThrow()

            if (mockParse?.help && mockHelpReporter) {
              // The help reporter should now be called via the help instance
              expect(mockHelpReporter).toHaveBeenCalled()
            }

            if (mockParse?.actions.length) {
              mockParse.actions.forEach((action) => {
                expect(action).toHaveBeenCalledWith(mockParse.flags)
              })
            }
          }
        },
      )
    })

    it("should propagate CLIError from parse method", async () => {
      const cli = new CLI({
        name: "test-cli",
        description: "Test CLI",
        registry: new CLIRegistry(),
      })

      cli.parse = vi.fn().mockImplementation(() => {
        // @ts-expect-error - Mock the parse method
        throw new CLIError("Test error")
      })

      await expect(cli.run([])).rejects.toBeInstanceOf(CLIError)
    })

    it("should wrap non-CLIError exceptions during run", async () => {
      const cli = new CLI({
        name: "test-cli",
        description: "Test CLI",
        registry: new CLIRegistry(),
      })

      cli.parse = vi.fn().mockImplementation(() => {
        throw new Error("Generic error")
      })

      await expect(cli.run([])).rejects.toThrow("CLI_INPUT_PROCESSING_FAILED")
    })
  })
})
