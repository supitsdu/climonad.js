import { describe, expect, it, vi } from "vitest"
import { Command } from "../src/Command"
import { bool, num, str } from "../src/Flag"
import { Setup, cli } from "../src/Setup"

describe("Setup", () => {
  describe("Constructor", () => {
    it("should create Setup instance with basic config", () => {
      const setup = new Setup({
        name: "test",
        description: "test cli",
      })

      expect(setup).toBeInstanceOf(Setup)
      const debug = setup.debug()
      expect(debug.global).toBeDefined()
      expect(debug.current).toBeDefined()
    })

    it("should initialize with flags and commands", () => {
      const setup = new Setup({
        name: "test",
        description: "test cli",
        flags: [bool({ name: "verbose", description: "verbose mode" })],
        commands: [
          new Command({
            name: "init",
            description: "initialize",
          }),
        ],
      })

      const debug = setup.debug()
      expect(debug.global.flagsList).toHaveLength(1)
      expect(debug.global.commandsList).toHaveLength(1)
    })
  })

  describe("Flag and Command Management", () => {
    it("should correctly check for flag existence", () => {
      const setup = new Setup({
        name: "test",
        description: "test cli",
        flags: [bool({ name: "verbose", description: "verbose mode" })],
      })

      expect(setup.hasFlag("--verbose")).toBe(true)
      expect(setup.hasFlag("--nonexistent")).toBe(false)
    })

    it("should correctly retrieve flags", () => {
      const flag = bool({ name: "verbose", description: "verbose mode" })
      const setup = new Setup({
        name: "test",
        description: "test cli",
        flags: [flag],
      })

      expect(setup.getFlag("--verbose")).toBe(flag)
      expect(setup.getFlag("--nonexistent")).toBeNull()
    })

    it("should correctly check for command existence", () => {
      const setup = new Setup({
        name: "test",
        description: "test cli",
        commands: [
          new Command({
            name: "init",
            description: "initialize",
          }),
        ],
      })

      expect(setup.hasCmd("init")).toBe(true)
      expect(setup.hasCmd("nonexistent")).toBe(false)
    })
  })

  describe("Argument Parsing", () => {
    it("should parse boolean flags", async () => {
      const setup = new Setup({
        name: "test",
        description: "test cli",
        flags: [bool({ name: "verbose", description: "verbose mode" })],
      })

      const result = await setup.parse(["node", "cli", "--verbose"])
      expect(result.flags.get("verbose")).toBe(true)
    })

    it("should parse string flags", async () => {
      const setup = new Setup({
        name: "test",
        description: "test cli",
        flags: [str({ name: "name", description: "project name" })],
      })

      const result = await setup.parse(["node", "cli", "--name", "test-project"])
      expect(result.flags.get("name")).toBe("test-project")
    })

    it("should parse number flags", async () => {
      const setup = new Setup({
        name: "test",
        description: "test cli",
        flags: [num({ name: "port", description: "port number" })],
      })

      const result = await setup.parse(["node", "cli", "--port", "3000"])
      expect(result.flags.get("port")).toBe(3000)
    })

    it("should throw on unknown tokens", async () => {
      const setup = new Setup({
        name: "test",
        description: "test cli",
      })

      await expect(setup.parse(["node", "cli", "--unknown"])).rejects.toThrow("Unknown token: --unknown")
    })
  })

  describe("Requirement Validation", () => {
    it("should validate required flags", async () => {
      const setup = new Setup({
        name: "test",
        description: "test cli",
        flags: [str({ name: "name", description: "project name", required: true })],
      })

      await expect(setup.run(["node", "cli"])).rejects.toThrow("Missing required flag: name")
    })

    it("should validate required commands", async () => {
      const setup = new Setup({
        name: "test",
        description: "test cli",
        commands: [
          new Command({
            name: "init",
            description: "initialize",
            required: true,
          }),
        ],
      })

      await expect(setup.run(["node", "cli"])).rejects.toThrow("Missing required command: init")
    })
  })

  describe("Usage Reporting", () => {
    it("should handle usage reporting", async () => {
      const reporter = vi.fn()
      const setup = new Setup({
        name: "test",
        description: "test cli",
        onUsageReporter: reporter,
        usageFlag: "help",
        flags: [bool({ name: "help", description: "show help" })],
      })

      await setup.run(["node", "cli", "--help"])
      expect(reporter).toHaveBeenCalled()
    })

    it("should throw when no usage reporter is available", async () => {
      const setup = new Setup({
        name: "test",
        description: "test cli",
        usageFlag: "help",
      })

      await expect(setup.run(["node", "cli", "--help"])).rejects.toThrow()
    })
  })

  describe("CLI Factory", () => {
    it("should create new Setup instance", () => {
      const instance = cli({
        name: "test",
        description: "test cli",
      })

      expect(instance).toBeInstanceOf(Setup)
    })

    it("should return existing Setup instance", () => {
      const setup = new Setup({
        name: "test",
        description: "test cli",
      })

      const instance = cli(setup)
      expect(instance).toBe(setup)
    })
  })
})
