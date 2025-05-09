import { describe, expect, it } from "vitest"
import { CLIRegistry } from "../../src/core"
import { CLIHelpConstructor } from "../../src"
import { CLIHelp, createCLIHelp } from "../../src/ui/help"

// Minimal type definition for CLIEntry for testing purposes.
interface CLIEntry {
  index: number
  parentIndex: number | null
  kind: "root" | "command" | "flag"
  name: string
  description: string
}

// Minimal registry type used for tests.
interface FakeRegistry {
  nodes: CLIEntry[]
  children: Record<number, number[]>
}

describe("Help System", () => {
  describe("createCLIHelp", () => {
    it("should create a help instance with default values", () => {
      const mockReporter = () => {}
      const help = createCLIHelp(mockReporter)

      expect(help).toBeInstanceOf(CLIHelp)
      expect(help.reporter).toBe(mockReporter)
      expect(help.def.name).toBe("help")
      expect(help.def.description).toBe("Display help information")
      expect(help.def.aliases).toEqual(["h"])
      expect(help.kind).toBe("flag")
    })

    it("should create a help instance with custom values", () => {
      const mockReporter = () => {}
      const help = createCLIHelp(mockReporter, {
        name: "assist",
        description: "Show assistance",
        aliases: ["a", "?"],
        kind: "command",
      })

      expect(help).toBeInstanceOf(CLIHelp)
      expect(help.reporter).toBe(mockReporter)
      expect(help.def.name).toBe("assist")
      expect(help.def.description).toBe("Show assistance")
      expect(help.def.aliases).toEqual(["a", "?"])
      expect(help.kind).toBe("command")
    })
  })

  describe("CLIHelpConstructor", () => {
    const fixtures: {
      description: string
      registry: FakeRegistry
      lastCommand: number
      expected: {
        parent: number | null
        commands: number[]
        flags: number[]
      }
    }[] = [
      {
        description: "Root with no parent and no children",
        registry: {
          nodes: [{ index: 0, parentIndex: null, kind: "root", name: "root", description: "root" }],
          children: { 0: [] },
        },
        lastCommand: 0,
        expected: {
          parent: null,
          commands: [],
          flags: [],
        },
      },
      {
        description: "Root with command and flag children",
        registry: {
          nodes: [
            { index: 0, parentIndex: null, kind: "root", name: "root", description: "root" },
            { index: 1, parentIndex: 0, kind: "command", name: "cmd1", description: "command" },
            { index: 2, parentIndex: 0, kind: "flag", name: "flag1", description: "flag" },
            { index: 3, parentIndex: 0, kind: "command", name: "cmd2", description: "another command" },
          ],
          children: { 0: [1, 2, 3] },
        },
        lastCommand: 0,
        expected: {
          parent: null,
          commands: [1, 3],
          flags: [2],
        },
      },
      {
        description: "Root with a parent and children",
        registry: {
          nodes: [
            { index: 0, parentIndex: 3, kind: "command", name: "child", description: "child command" },
            { index: 1, parentIndex: 0, kind: "command", name: "cmd1", description: "command" },
            { index: 2, parentIndex: 0, kind: "flag", name: "flag1", description: "flag" },
            { index: 3, parentIndex: null, kind: "command", name: "parent", description: "parent command" },
          ],
          children: { 0: [1, 2] },
        },
        lastCommand: 0,
        expected: {
          parent: 3,
          commands: [1],
          flags: [2],
        },
      },
    ]

    it.each(fixtures)("$description", ({ registry, lastCommand, expected }) => {
      const help = new CLIHelpConstructor(registry as CLIRegistry, lastCommand)
      // Verify the parent field
      expect(help.parent ? help.parent.index : null).toBe(expected.parent)
      // Verify the commands and flags extracted from children
      const commandsIndexes = help.commands.map((c) => c.index)
      const flagsIndexes = help.flags.map((c) => c.index)
      expect(commandsIndexes).toEqual(expected.commands)
      expect(flagsIndexes).toEqual(expected.flags)
    })
  })
})
