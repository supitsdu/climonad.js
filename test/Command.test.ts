import { describe, expect, it } from "vitest"
import { cmd, Command, CommandConfig, ParsedArgs } from "../src/Command"
import { bool, str } from "../src/Flag"

describe("Command", () => {
  describe("Constructor", () => {
    it("should create a command with basic properties", () => {
      const command = new Command({
        name: "test",
        description: "test command",
      })

      expect(command.name).toBe("test")
      expect(command.description).toBe("test command")
      expect(command.required).toBe(false)
      expect(command.alias).toBeUndefined()
      expect(command.flags).toBeUndefined()
      expect(command.commands).toBeUndefined()
      expect(command.action).toBeUndefined()
    })

    it("should create a command with all properties", () => {
      const flags = [str({ name: "test", description: "test flag" })]
      const subcommands = [new Command({ name: "sub", description: "sub command" })]
      const action = async () => {}
      const usageReporter = async () => {}

      const command = new Command({
        name: "test",
        description: "test command",
        required: true,
        alias: "t",
        flags,
        commands: subcommands,
        action,
        onUsageReporter: usageReporter,
      })

      expect(command.name).toBe("test")
      expect(command.description).toBe("test command")
      expect(command.required).toBe(true)
      expect(command.alias).toBe("t")
      expect(command.flags).toEqual(flags)
      expect(command.commands).toEqual(subcommands)
      expect(command.action).toBe(action)
      expect(command.onUsageReporter).toBe(usageReporter)
    })
  })

  describe("Command Factory", () => {
    it("should create new command instance from config", () => {
      const config: CommandConfig = {
        name: "test",
        description: "test command",
      }

      const command = cmd(config)
      expect(command).toBeInstanceOf(Command)
      expect(command.name).toBe("test")
    })

    it("should return existing command instance", () => {
      const existing = new Command({
        name: "test",
        description: "test command",
      })

      const command = cmd(existing)
      expect(command).toBe(existing)
    })
  })

  describe("Command Actions", () => {
    it("should execute command action with parsed args", async () => {
      let executed = false
      const parsedArgs: ParsedArgs = {
        flags: new Map([["verbose", true]]),
        commands: new Map(),
      }

      const command = new Command({
        name: "test",
        description: "test command",
        action: async (args) => {
          expect(args).toBe(parsedArgs)
          executed = true
        },
      })

      await command.action!(parsedArgs, command.name)
      expect(executed).toBe(true)
    })

    it("should handle commands with subcommands", () => {
      const subcommand = new Command({
        name: "sub",
        description: "subcommand",
      })

      const command = new Command({
        name: "main",
        description: "main command",
        commands: [subcommand],
      })

      expect(command.commands).toContain(subcommand)
    })

    it("should handle commands with flags", () => {
      const flag = bool({
        name: "verbose",
        description: "verbose mode",
      })

      const command = new Command({
        name: "test",
        description: "test command",
        flags: [flag],
      })

      expect(command.flags).toContain(flag)
    })
  })

  describe("Usage Reporter", () => {
    it("should execute usage reporter", async () => {
      let reported = false
      const command = new Command({
        name: "test",
        description: "test command",
        onUsageReporter: async (cmd) => {
          expect(cmd.name).toBe("test")
          reported = true
        },
      })

      await command.onUsageReporter!(command)
      expect(reported).toBe(true)
    })
  })
})
