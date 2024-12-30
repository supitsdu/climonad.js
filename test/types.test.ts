import { describe, expect, it } from "vitest"
import { Command, type CommandConfig, Flag, type FlagConfig } from "../src/types"

// Concrete test class for Flag
class TestFlag extends Flag {
  isValid(_: unknown): boolean {
    return true
  }
  convert(value: unknown): any {
    return value
  }
}

describe("Flag", () => {
  it("should create a flag with default values", () => {
    const config: FlagConfig = {
      name: "test",
      flag: "--test",
      description: "test flag",
    }
    const flag = new TestFlag(config)

    expect(flag.type).toBe("string")
    expect(flag.name).toBe("test")
    expect(flag.flag).toBe("--test")
    expect(flag.description).toBe("test flag")
    expect(flag.alias).toBeUndefined()
    expect(flag.default).toBeUndefined()
    expect(flag.multiple).toBeUndefined()
  })

  it("should create a flag with all properties set", () => {
    const config: FlagConfig = {
      name: "test",
      flag: "--test",
      description: "test flag",
      type: "boolean",
      alias: "-t",
      default: true,
      multiple: true,
    }
    const flag = new TestFlag(config)

    expect(flag.type).toBe("boolean")
    expect(flag.name).toBe("test")
    expect(flag.flag).toBe("--test")
    expect(flag.description).toBe("test flag")
    expect(flag.alias).toBe("-t")
    expect(flag.default).toBe(true)
    expect(flag.multiple).toBe(true)
  })
})

describe("Command", () => {
  it("should create a command with minimal properties", () => {
    const config: CommandConfig = {
      name: "test",
      description: "test command",
    }
    const command = new Command(config)

    expect(command.name).toBe("test")
    expect(command.description).toBe("test command")
    expect(command.flag).toBeUndefined()
    expect(command.alias).toBeUndefined()
    expect(command.commands).toBeUndefined()
    expect(command.flags).toBeUndefined()
  })

  it("should create a command with all properties set", () => {
    const subCommand = new Command({
      name: "sub",
      description: "sub command",
    })
    const flag = new TestFlag({
      name: "flag",
      flag: "--flag",
      description: "test flag",
    })

    const config: CommandConfig = {
      name: "test",
      flag: "--test",
      description: "test command",
      alias: "-t",
      commands: [subCommand],
      flags: [flag],
    }
    const command = new Command(config)

    expect(command.name).toBe("test")
    expect(command.flag).toBe("--test")
    expect(command.description).toBe("test command")
    expect(command.alias).toBe("-t")
    expect(command.commands).toHaveLength(1)
    expect(command.commands![0]).toBe(subCommand)
    expect(command.flags).toHaveLength(1)
    expect(command.flags![0]).toBe(flag)
  })
})
