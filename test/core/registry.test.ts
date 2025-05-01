import { beforeEach, describe, expect, it, vi } from "vitest"
import { CLIRegistry } from "../../src/core"
import { CLIDefinition, CLIEntry, CLIEntryDefinition } from "../../src/types"

describe("CLIRegistry", () => {
  // Test fixtures to reduce repetition
  const fixtures = {
    cli: {
      basic: {
        name: "test-cli",
        description: "Test CLI",
      } as CLIDefinition,
      empty: {} as Partial<CLIDefinition>,
    },
    entries: {
      command: {
        name: "test-command",
        description: "Test command",
        kind: "command" as const,
        parentIndex: 0,
        tokens: null,
      } as CLIEntryDefinition,
      flag: {
        name: "test-flag",
        description: "Test flag",
        kind: "flag" as const,
        parentIndex: 0,
        tokens: null,
      } as CLIEntryDefinition,
      requiredFlag: {
        name: "required-flag",
        description: "Required flag",
        kind: "flag" as const,
        parentIndex: 0,
        tokens: null,
        required: true,
      } as CLIEntryDefinition,
      flagWithDefault: {
        name: "default-flag",
        description: "Flag with default",
        kind: "flag" as const,
        parentIndex: 0,
        tokens: null,
        default: "default value",
      } as CLIEntryDefinition,
    },
    mockTokens: {
      match: vi.fn(),
      tokens: new Set(["test"]),
    },
  }

  let registry: CLIRegistry

  beforeEach(() => {
    registry = new CLIRegistry()
  })

  describe("constructor", () => {
    it("should initialize empty data structures", () => {
      expect(registry.nodes).toEqual([])
      expect(registry.children).toEqual({})
      expect(registry.requires).toEqual({})
      expect(registry.withdefaults.size).toBe(0)
    })
  })

  describe("initialize", () => {
    it("should set up a root node at index 0 with default values", () => {
      registry.initialize(fixtures.cli.basic)

      expect(registry.nodes[0]).toEqual({
        ...fixtures.cli.basic,
        tokens: null,
        kind: "root",
        parentIndex: 0,
        index: 0,
      })
    })

    it("should use default values when name and description are not provided", () => {
      // @ts-expect-error test empty object
      registry.initialize(fixtures.cli.empty)

      expect(registry.nodes[0]).toEqual({
        name: "<root>",
        description: "Root command",
        tokens: null,
        kind: "root",
        parentIndex: 0,
        index: 0,
      })
    })
  })

  describe("register", () => {
    beforeEach(() => {
      registry.initialize(fixtures.cli.basic)
    })

    it("should register a new entry and return its index", () => {
      const entryWithTokens = {
        ...fixtures.entries.command,
        tokens: fixtures.mockTokens,
      }

      const index = registry.register(entryWithTokens)

      expect(index).toBe(1)
      expect(registry.nodes[1]).toEqual({
        ...entryWithTokens,
        index: 1,
      })
    })

    it("should add a dependency from parent to child", () => {
      registry.register(fixtures.entries.command)
      expect(registry.children[0]).toContain(1)
    })

    it("should add a requirement when required=true", () => {
      registry.register(fixtures.entries.requiredFlag)
      expect(registry.requires[0]).toContain(1)
    })

    it("should add to withdefaults when default is defined", () => {
      registry.register(fixtures.entries.flagWithDefault)
      expect(registry.withdefaults.has(1)).toBe(true)
    })

    it("should convert null parentIndex to 0", () => {
      const entryWithNullParent = {
        ...fixtures.entries.command,
        parentIndex: null,
      }

      registry.register(entryWithNullParent)
      expect(registry.nodes[1].parentIndex).toBe(0)
    })
  })

  describe("getEntry", () => {
    beforeEach(() => {
      registry.initialize(fixtures.cli.basic)
      registry.register(fixtures.entries.command)
    })

    it.each([
      { name: "numeric index", input: 1, expectedName: "test-command", expectedResult: "test-command" },
      { name: "string index", input: "1", expectedName: "test-command", expectedResult: "test-command" },
      { name: "out-of-bounds index", input: 999, expectedResult: null },
      { name: "negative index", input: -1, expectedResult: null },
    ])("should handle $name", (testCase) => {
      const entry = registry.getEntry(testCase.input)

      if (testCase.expectedResult === null) {
        expect(entry).toBeNull()
      } else {
        expect(entry?.name).toBe(testCase.expectedResult)
      }
    })
  })

  describe("addRequirement and addDependency", () => {
    beforeEach(() => {
      registry.initialize(fixtures.cli.basic)
    })

    it.each([
      {
        method: "addRequirement",
        description: "create requirements array if it doesn't exist",
        calls: [{ parentIdx: 0, childIdx: 1 }],
        expected: { property: "requires", parentIdx: 0, expectedArray: [1] },
      },
      {
        method: "addRequirement",
        description: "append to existing requirements",
        calls: [
          { parentIdx: 0, childIdx: 1 },
          { parentIdx: 0, childIdx: 2 },
        ],
        expected: { property: "requires", parentIdx: 0, expectedArray: [1, 2] },
      },
      {
        method: "addDependency",
        description: "create children array if it doesn't exist",
        calls: [{ parentIdx: 0, childIdx: 1 }],
        expected: { property: "children", parentIdx: 0, expectedArray: [1] },
      },
      {
        method: "addDependency",
        description: "append to existing children",
        calls: [
          { parentIdx: 0, childIdx: 1 },
          { parentIdx: 0, childIdx: 2 },
        ],
        expected: { property: "children", parentIdx: 0, expectedArray: [1, 2] },
      },
    ])("should $description with $method", ({ method, calls, expected }) => {
      calls.forEach((call) => {
        registry[method](call.parentIdx, call.childIdx)
      })
      expect(registry[expected.property][expected.parentIdx]).toEqual(expected.expectedArray)
    })
  })

  describe("set", () => {
    beforeEach(() => {
      registry.initialize(fixtures.cli.basic)
      registry.register(fixtures.entries.command)
    })

    it.each([
      {
        name: "update existing entry property",
        index: 1,
        key: "description" as const,
        value: "Updated description",
        assertion: (reg: CLIRegistry) => expect(reg.nodes[1].description).toBe("Updated description"),
      },
      {
        name: "do nothing for non-existent entry",
        index: 999,
        key: "name" as const,
        value: "nonexistent",
        assertion: (reg: CLIRegistry, before: CLIEntry[]) => expect(reg.nodes).toEqual(before),
      },
    ])("should $name", (testCase) => {
      const before = [...registry.nodes]
      registry.set(testCase.index, testCase.key, testCase.value)
      testCase.assertion(registry, before)
    })

    it("should preserve other properties when updating one property", () => {
      const before = { ...registry.nodes[1] }
      registry.set(1, "name", "updated-name")

      expect(registry.nodes[1].name).toBe("updated-name")
      expect(registry.nodes[1].description).toBe(before.description)
      expect(registry.nodes[1].kind).toBe(before.kind)
      expect(registry.nodes[1].parentIndex).toBe(before.parentIndex)
    })
  })

  describe("complex scenarios", () => {
    beforeEach(() => {
      registry.initialize(fixtures.cli.basic)
    })

    it("should support command hierarchies with proper parent-child relationships", () => {
      // Register parent command
      const parentIndex = registry.register({
        ...fixtures.entries.command,
        name: "parent-command",
      })

      // Register child command with parent reference
      const childIndex = registry.register({
        ...fixtures.entries.command,
        name: "child-command",
        parentIndex: parentIndex,
      })

      // Register grandchild command
      const grandchildIndex = registry.register({
        ...fixtures.entries.command,
        name: "grandchild-command",
        parentIndex: childIndex,
      })

      // Verify parent-child relationships
      expect(registry.children[parentIndex]).toContain(childIndex)
      expect(registry.children[childIndex]).toContain(grandchildIndex)
      expect(registry.nodes[childIndex].parentIndex).toBe(parentIndex)
      expect(registry.nodes[grandchildIndex].parentIndex).toBe(childIndex)
    })

    it("should handle dependency chains for required flags", () => {
      // Create a dependency chain where flags require each other
      const flagAIndex = registry.register({
        ...fixtures.entries.flag,
        name: "flag-a",
      })

      const flagBIndex = registry.register({
        ...fixtures.entries.flag,
        name: "flag-b",
        required: true,
      })

      const flagCIndex = registry.register({
        ...fixtures.entries.flag,
        name: "flag-c",
        required: true,
      })

      // Set up requirements: A requires B which requires C
      registry.addRequirement(flagAIndex, flagBIndex)
      registry.addRequirement(flagBIndex, flagCIndex)

      // Verify the requirement chain
      expect(registry.requires[flagAIndex]).toContain(flagBIndex)
      expect(registry.requires[flagBIndex]).toContain(flagCIndex)
    })

    it("should correctly handle multiple flags with default values", () => {
      // Register multiple flags with default values
      registry.register({
        ...fixtures.entries.flag,
        name: "flag-1",
        default: "default-1",
      })

      registry.register({
        ...fixtures.entries.flag,
        name: "flag-2",
        default: 42,
      })

      registry.register({
        ...fixtures.entries.flag,
        name: "flag-3",
        default: true,
      })

      // Verify all flags are in the withdefaults set
      expect(registry.withdefaults.size).toBe(3)
      expect(registry.withdefaults.has(1)).toBe(true)
      expect(registry.withdefaults.has(2)).toBe(true)
      expect(registry.withdefaults.has(3)).toBe(true)
    })

    it.each([
      { name: "command", entry: { ...fixtures.entries.command, name: "test-1" }, expectedKind: "command" },
      { name: "flag", entry: { ...fixtures.entries.flag, name: "test-2" }, expectedKind: "flag" },
      { name: "required flag", entry: { ...fixtures.entries.requiredFlag, name: "test-3" }, expectedKind: "flag" },
    ])("should correctly register different entry types ($name)", ({ entry, expectedKind }) => {
      const index = registry.register(entry)
      expect(registry.nodes[index].kind).toBe(expectedKind)
      expect(registry.nodes[index].name).toBe(entry.name)
    })
  })
})
