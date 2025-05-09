import { describe, expect, it, vi } from "vitest"
import { processTokens } from "../../src/helpers/cli-helpers"
import { CLI } from "../../src/createCLI"

describe("CLI Helpers", () => {
  describe("processTokens", () => {
    // Test fixtures
    const mockRegistry = {
      nodes: [
        { index: 0, kind: "root", name: "cli", action: null },
        { index: 1, kind: "flag", name: "help", value: true },
        { index: 2, kind: "command", name: "help", action: null },
        { index: 3, kind: "command", name: "run", action: vi.fn() },
        { index: 4, kind: "flag", name: "verbose", value: true },
        { index: 5, kind: "flag", name: "silent", value: false },
      ],
    }

    it("should detect flag-type help request when value is true", () => {
      const indices = new Set([0, 1]) // root + help flag
      const helpDef = { name: "help" }
      const mockCLI = {} as CLI<any>

      const result = processTokens(indices, mockRegistry as any, {
        instance: mockCLI,
        def: helpDef,
      })

      expect(result.shouldShowHelp).toBe(true)
    })

    it("should not detect flag-type help request when value is false", () => {
      const indices = new Set([0, 5]) // root + silent flag (value: false)
      const helpDef = { name: "silent" }
      const mockCLI = {} as CLI<any>

      const result = processTokens(indices, mockRegistry as any, {
        instance: mockCLI,
        def: helpDef,
      })

      expect(result.shouldShowHelp).toBe(false)
    })

    it("should detect command-type help request", () => {
      const indices = new Set([0, 2]) // root + help command
      const helpDef = { name: "help" }
      const mockCLI = {} as CLI<any>

      const result = processTokens(indices, mockRegistry as any, {
        instance: mockCLI,
        def: helpDef,
      })

      expect(result.shouldShowHelp).toBe(true)
    })

    it("should collect actions from command entries", () => {
      const indices = new Set([0, 3]) // root + run command
      const helpDef = { name: "help" }
      const mockCLI = {} as CLI<any>

      const result = processTokens(indices, mockRegistry as any, {
        instance: mockCLI,
        def: helpDef,
      })

      expect(result.actions.length).toBe(1)
      expect(result.lastCommandIndex).toBe(3)
    })

    it("should collect flag values", () => {
      const indices = new Set([0, 4]) // root + verbose flag
      const helpDef = { name: "help" }
      const mockCLI = {} as CLI<any>

      const result = processTokens(indices, mockRegistry as any, {
        instance: mockCLI,
        def: helpDef,
      })

      expect(result.flags.get("verbose")).toBe(true)
    })

    it("should not detect help when help instance is null", () => {
      const indices = new Set([0, 1]) // root + help flag
      const helpDef = { name: "help" }

      const result = processTokens(indices, mockRegistry as any, {
        instance: null,
        def: helpDef,
      })

      expect(result.shouldShowHelp).toBe(false)
    })
  })
})
