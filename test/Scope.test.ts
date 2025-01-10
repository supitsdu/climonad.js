import { beforeEach, describe, expect, it } from "vitest"
import { Command } from "../src/Command"
import { Flag } from "../src/Flag"
import { Scope } from "../src/Scope"

describe("Scope", () => {
  let scope: Scope

  beforeEach(() => {
    scope = new Scope()
  })

  it("should add and retrieve flags correctly", () => {
    const flag = new Flag({
      type: "string",
      name: "testFlag",
      description: "A test flag",
    })

    scope.addFlag(flag)
    expect(scope.hasFlag("--testFlag")).toBe(true)
    expect(scope.getFlag("--testFlag")).toBe(flag)
  })

  it("should add and retrieve commands correctly", () => {
    const command = new Command({
      name: "testCmd",
      description: "A test command",
      action: async () => {},
    })

    scope.addCmd(command)
    expect(scope.hasCmd("testCmd")).toBe(true)
    expect(scope.getCmd("testCmd")).toBe(command)
  })

  it("should track required flags", () => {
    const requiredFlag = new Flag({
      type: "string",
      name: "requiredFlag",
      description: "A required flag",
      required: true,
    })

    scope.addFlag(requiredFlag)
    // Accessing private property for testing purposes
    expect((scope as any).requiredFlags).toContain(scope.getFlagIndex("--requiredFlag"))
  })

  it("should track flags with default values", () => {
    const defaultFlag = new Flag({
      type: "number",
      name: "defaultFlag",
      description: "A flag with a default value",
      default: 42,
    })

    scope.addFlag(defaultFlag)
    // Accessing private property for testing purposes
    expect((scope as any).flagsWithDefaultValues).toContain(scope.getFlagIndex("--defaultFlag"))
  })

  it("should manage usage reporters correctly", () => {
    const reporter = async (command: Command) => {
      const _ = `Usage for ${command.name}`
    }

    scope.setUsageReporter("testReporter", reporter)
    expect(scope.hasUsageReporter("testReporter")).toBe(true)
    expect(scope.getUsageReporter("testReporter")).toBe(reporter)
  })

  it("should correctly identify existing keys using has()", () => {
    const flag = new Flag({
      type: "boolean",
      name: "existingFlag",
      description: "An existing flag",
    })

    scope.addFlag(flag)

    expect(scope.has(0)).toBe(true)
    expect(scope.has(132)).toBe(false)
  })

  it("should handle flag aliases correctly", () => {
    const flag = new Flag({
      type: "string",
      name: "test",
      alias: "t",
      description: "A test flag",
    })

    scope.addFlag(flag)
    expect(scope.hasFlag("--test")).toBe(true)
    expect(scope.hasFlag("-t")).toBe(true)
    expect(scope.getFlag("--test")).toBe(flag)
    expect(scope.getFlag("-t")).toBe(flag)
  })

  it("should handle command aliases correctly", () => {
    const command = new Command({
      name: "test",
      alias: "t",
      description: "A test command",
      action: async () => {},
    })

    scope.addCmd(command)
    expect(scope.hasCmd("test")).toBe(true)
    expect(scope.hasCmd("t")).toBe(true)
    expect(scope.getCmd("test")).toBe(command)
    expect(scope.getCmd("t")).toBe(command)
  })

  it("should throw error when adding invalid flag", () => {
    expect(() => {
      scope.addFlag({} as Flag)
    }).toThrow("Failed to add flag: entry is not an instance of Flag")
  })

  it("should throw error when adding invalid command", () => {
    expect(() => {
      scope.addCmd({} as Command)
    }).toThrow("Failed to add command: entry is not an instance of Command")
  })

  it("should track command stack correctly", () => {
    const cmd1 = new Command({
      name: "cmd1",
      description: "Command 1",
    })
    const cmd2 = new Command({
      name: "cmd2",
      description: "Command 2",
    })

    scope.addCmd(cmd1)
    scope.addCmd(cmd2)

    const debug = scope.debug()
    expect(debug.commandsStack).toEqual([0, 1])
  })

  it("should return correct debug information", () => {
    const flag = new Flag({
      type: "string",
      name: "test",
      description: "Test flag",
      required: true,
    })
    const command = new Command({
      name: "test",
      description: "Test command",
      required: true,
    })

    scope.addFlag(flag)
    scope.addCmd(command)

    const debug = scope.debug()
    expect(debug.flagsList).toHaveLength(1)
    expect(debug.commandsList).toHaveLength(1)
    expect(debug.requiredFlags).toHaveLength(1)
    expect(debug.requiredCommands).toHaveLength(1)
    expect(debug.flags.size).toBe(1)
    expect(debug.commands.size).toBe(1)
  })

  it("should handle index-based access correctly", () => {
    const flag = new Flag({
      type: "string",
      name: "test",
      description: "Test flag",
    })

    scope.addFlag(flag)

    expect(scope.has(0)).toBe(true)
    expect(scope.has(1)).toBe(false)
    expect(scope.getFlagIndex("--test")).toBe(0)
    expect(scope.getFlagIndex("--nonexistent")).toBe(null)
  })
})
