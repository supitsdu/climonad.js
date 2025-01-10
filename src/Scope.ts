import { Command } from "./Command"
import { Flag } from "./Flag"

// === Scope Properties ===
export class Scope {
  private readonly flags: Map<string, number> = new Map()
  private readonly commands: Map<string, number> = new Map()

  private readonly flagsList: Flag[] = []
  private readonly commandsList: Command[] = []

  private readonly requiredFlags: number[] = []
  private readonly requiredCommands: number[] = []

  private readonly flagsWithDefaultValues: number[] = []

  private readonly commandsStack: number[] = []

  private readonly usageReporters: Map<string, (command: Command) => Promise<void> | void> = new Map()

  // === Constructor ===
  constructor() {}

  // === Debugging Methods ===
  debug() {
    return {
      flagsList: this.flagsList,
      commandsList: this.commandsList,

      flags: this.flags,
      commands: this.commands,

      requiredFlags: this.requiredFlags,
      requiredCommands: this.requiredCommands,

      commandsStack: this.commandsStack,

      usageReporters: this.usageReporters,
    }
  }

  // === Flag Management Methods ===
  forEachRequiredFlag(callback: (flag: Flag, index: number) => void): void {
    for (const index of this.requiredFlags) {
      callback(this.flagsList[index], index)
    }
  }

  forEachFlagWithDefaultValue(callback: (flag: Flag, index: number) => void): void {
    for (const index of this.flagsWithDefaultValues) {
      callback(this.flagsList[index], index)
    }
  }

  // === Command Management Methods ===
  forEachRequiredCommand(callback: (command: Command, index: number) => void): void {
    for (const index of this.requiredCommands) {
      callback(this.commandsList[index], index)
    }
  }

  // === Usage Reporter Management Methods ===
  setUsageReporter(name: string, reporter: (command: Command) => Promise<void> | void): void {
    this.usageReporters.set(name, reporter)
  }

  hasUsageReporter(name: string): boolean {
    return this.usageReporters.has(name)
  }

  getUsageReporter(name: string): (command: Command) => Promise<void> | void {
    return this.usageReporters.get(name)!
  }

  // === General Utility Methods ===
  has(key: number): boolean {
    return this.flagsList[key] !== undefined || this.commandsList[key] !== undefined
  }

  hasFlag(key: string): boolean {
    return this.flags.has(key)
  }

  hasCmd(key: string): boolean {
    return this.commands.has(key)
  }

  getFlagIndex(key: string): number | null {
    return this.flags.get(key) ?? null
  }

  getCmdIndex(key: string): number | null {
    return this.commands.get(key) ?? null
  }

  getFlag(key: string): Flag | null {
    return (this.flagsList[this.getFlagIndex(key)!] as Flag) ?? null
  }

  getCmd(key: string): Command | null {
    return (this.commandsList[this.getCmdIndex(key)!] as Command) ?? null
  }

  // === Methods to Add Flags and Commands ===
  addFlag(entry: Flag): void {
    // Ensure the entry is an instance of Flag before adding
    if (!(entry instanceof Flag)) {
      throw new Error("Failed to add flag: entry is not an instance of Flag")
    }

    const { key, alias } = { key: `--${entry.name}`, alias: entry.alias ? `-${entry.alias}` : undefined }
    const index = this.flagsList.length

    // Map flag keys and aliases to their index
    this.flags.set(key, index)

    if (alias) this.flags.set(alias, index)

    // Track required flags
    if (entry.required) this.requiredFlags.push(index)

    // Track flags with default values
    if (entry.default !== undefined) this.flagsWithDefaultValues.push(index)

    // Add the flag to the flags list
    this.flagsList[index] = entry
  }

  addCmd(entry: Command): void {
    // Ensure the entry is an instance of Command before adding
    if (!(entry instanceof Command)) {
      throw new Error("Failed to add command: entry is not an instance of Command")
    }

    const { key, alias } = { key: entry.name, alias: entry.alias }
    const index = this.commandsList.length

    // Map command keys and aliases to their index
    this.commands.set(key, index)

    if (alias) this.commands.set(alias, index)

    // Track required commands
    if (entry.required) this.requiredCommands.push(index)

    // Set usage reporter if defined
    if (typeof entry.onUsageReporter === "function") this.setUsageReporter(entry.name, entry.onUsageReporter)

    // Add the command to the commands list and stack
    this.commandsList[index] = entry
    this.commandsStack.push(index)
  }
}
