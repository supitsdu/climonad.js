import { Flag } from "./Flag"
import { PrimitiveValues } from "./types"

// === Type Definitions for Parsing ===
export type ParsedFlags = Map<string, PrimitiveValues>
export type ParsedCommands = Map<string, CommandAction | undefined>
export type ParsedArgs = { flags: ParsedFlags; commands: ParsedCommands }
export type CommandAction = (parsedArgs: ParsedArgs, command: string) => void | Promise<void>

// === Command Configuration Interface ===
export interface CommandConfig {
  name: string
  description: string
  alias?: string
  required?: boolean
  flags?: Flag[]
  commands?: Command[]
  action?: CommandAction
  onUsageReporter?: (command: Command) => Promise<void> | void
}

// === Command Class Implementation ===
export class Command {
  public readonly name: string
  public readonly description: string
  public readonly alias?: string
  public readonly required: boolean
  public readonly flags?: Flag[]
  public readonly commands?: Command[]
  public readonly action?: CommandAction
  public readonly onUsageReporter?: (command: Command) => Promise<void> | void

  // Initialize command properties
  constructor(config: CommandConfig) {
    this.name = config.name
    this.description = config.description
    this.required = config.required || false
    this.alias = config.alias
    this.flags = config.flags
    this.commands = config.commands
    this.action = config.action
    this.onUsageReporter = config.onUsageReporter
  }
}

// === Command Factory Function ===
export function cmd(config: CommandConfig | Command) {
  // Create a new Command instance or return existing one
  if (config instanceof Command) return config
  return new Command(config)
}
