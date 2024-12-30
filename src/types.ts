/**
 * Base configuration for commands and flags.
 */
export interface BaseConfig {
  name: string
  flag?: string
  alias?: string
  description: string
}

/**
 * The available types for flags.
 */
export type FlagType = "string" | "boolean" | "number"

/**
 * Configuration interface for defining a flag.
 */
export interface FlagConfig extends Omit<BaseConfig, "flag"> {
  flag: string
  type?: FlagType
  default?: any
  multiple?: boolean
  required?: boolean
}

/**
 * Configuration interface for defining a command.
 */
export interface CommandConfig extends BaseConfig {
  commands?: Command[]
  flags?: Flag[] // renamed from options
}

/**
 * Structure representing the usage information for a command.
 */
export interface CommandUsage {
  name: string
  description: string
  commands?: CommandInfo[]
  flags?: FlagInfo[]
}

/**
 * Information about a command, used in help display.
 */
export type CommandInfo = BaseConfig

/**
 * Information about a flag, used in help display.
 */
export interface FlagInfo extends BaseConfig {
  type: FlagType
}

/**
 * Configuration for initializing the CLI.
 */
export interface CliConfig {
  name: string
  description: string
  commands?: Command[]
  flags?: Flag[]
}

/**
 * Specialized flag configuration for different types.
 */
export interface StringFlagConfig extends FlagConfig {
  default?: string
}

export interface BooleanFlagConfig extends FlagConfig {
  default?: boolean
}

export interface NumberFlagConfig extends FlagConfig {
  default?: number
}

/**
 * Abstract base class for flags.
 */
export abstract class Flag {
  public readonly type: FlagType
  public readonly name: string
  public readonly flag: string
  public readonly description: string
  public readonly alias?: string
  public readonly default?: any
  public readonly multiple?: boolean
  public readonly required?: boolean

  constructor(config: FlagConfig) {
    this.type = config.type || "string"
    this.name = config.name
    this.flag = config.flag
    this.description = config.description
    this.alias = config.alias
    this.default = config.default
    this.multiple = config.multiple
    this.required = config.required
  }

  /**
   * Checks if the provided value is valid for this flag.
   * @param value The value to validate.
   * @returns True if valid, false otherwise.
   */
  abstract isValid(value: unknown): boolean

  /**
   * Converts the provided value to the appropriate type.
   * @param value The value to convert.
   * @returns The converted value.
   */
  abstract convert(value: unknown): any
}

/**
 * Class representing a command in the CLI.
 */
export class Command {
  public readonly name: string
  public readonly flag?: string
  public readonly description: string
  public readonly alias?: string
  public readonly commands?: Command[]
  public flags?: Flag[] // renamed from options

  constructor(config: CommandConfig) {
    this.name = config.name
    this.flag = config.flag
    this.description = config.description
    this.alias = config.alias
    this.commands = config.commands
    this.flags = config.flags
  }
}
