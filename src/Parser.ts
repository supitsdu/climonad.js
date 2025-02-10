import { CliError } from "./CliError"
import { Event } from "./Event"
import { IntelliScope } from "./Scope"

// === Type Definitions for Parsing ===
export type PrimitiveValues = string | number | boolean
export type ParsedFlags = Map<string, PrimitiveValues>
export type ParsedCommands = Map<string, CommandAction | undefined>
export type ParsedArgs = { flags: ParsedFlags; commands: ParsedCommands }
export type CommandAction = (parsedArgs: ParsedArgs, command: string) => void | Promise<void>
export type ParserFn<T = any> = (this: Parser, flag: Flag<T>) => T | null | Promise<T | null>

// === Type Defitions for Usage ===
export type UsageReporter = (command: Command) => Promise<void> | void

// === Command Configuration Interface ===
export interface CommandConfig {
  name: string
  description: string
  alias?: string | string[]
  required?: boolean
  flags?: Flag[]
  commands?: Command[]
  action?: CommandAction
  usageReporter?: UsageReporter
  prefix?: string
  aliasPrefix?: string
}

export interface ParserConfig extends CommandConfig {
  startIndex?: number
}

// === Flag Configuration Interfaces ===
export interface FlagConstructorConfig<T> extends FlagConfig<T> {
  type: string
}
export interface FlagConfig<T> {
  name: string
  description: string
  alias?: string | string[]
  required?: boolean
  default?: T
  parser?: ParserFn<T>
  prefix?: string
  aliasPrefix?: string
}

/**
 * The Parser class orchestrates the command and flag analysis from CLI arguments.
 * It maintains an IntelliScope to track flags and commands, as well as the parsed arguments.
 */
export class Parser {
  private readonly parsedArgs: ParsedArgs
  private readonly scope: IntelliScope
  private readonly argv: string[]
  private index: number
  private event: Event

  /**
   * Creates a Parser instance.
   * @param argv - The array of raw CLI arguments.
   * @param index - The starting index to begin parsing from.
   */
  constructor(argv: string[], index: number, event: Event) {
    this.scope = new IntelliScope()
    this.argv = argv
    this.index = index
    this.parsedArgs = { flags: new Map(), commands: new Map() }
    this.event = event
  }

  /**
   * Retrieves the final parsed arguments.
   * @returns ParsedArgs object containing parsed flags and commands.
   */
  get value() {
    return this.parsedArgs
  }

  /**
   * Sets a flag with the given value in the parsed arguments.
   * @param flag - Name of the flag to set.
   * @param value - Value to assign to the flag.
   */
  set(flag: string, value: any) {
    this.parsedArgs.flags.set(flag, value)
  }

  /**
   * Returns the current token in the argument array.
   * @returns The current token string.
   */
  current() {
    return this.argv[this.index]
  }

  next() {
    return this.argv[this.index + 1]
  }

  hasNext() {
    return this.index <= this.next.length
  }

  incrementIndex() {
    return this.index++
  }

  setIndex(index: number) {
    this.index = index
  }

  /**
   * Searches for a matching command or flag within the IntelliScope by key.
   * @param key - The command or flag key to search for.
   * @returns The matching command or flag, or null if none found.
   */
  search(key: string) {
    return this.scope.findEntry(key)
  }

  /**
   * Adds commands and flags from the given entry to the IntelliScope.
   * @param entry - An object potentially containing commands or flags arrays.
   */
  createScope<T extends { flags?: any[]; commands?: any[] }>(entry: T) {
    this.scope.create(entry.commands, entry.flags)
  }

  /**
   * Stores the command's action in parsedArgs and updates scope with nested commands/flags.
   * @param entry - A command configuration object with optional action.
   */
  updateScope(entry: { commands?: any[]; flags?: any[]; name: string; action?: any }) {
    this.parsedArgs.commands.set(entry.name, entry.action)
    this.createScope(entry)
  }

  /**
   * Checks for any missing requirements in the provided parsed arguments.
   * @param parsedArgs - The already parsed arguments to validate.
   */
  validateAll(parsedArgs: ParsedArgs) {
    this.scope.validateAll(parsedArgs)
  }

  hasHelpFlag() {
    return this.parsedArgs.flags.has("help")
  }

  /**
   * Parses the CLI arguments based on the provided options and events.
   * @param argv - Array of CLI arguments.
   * @param options - Configuration options for the Parser.
   * @param events - Event emitter instance for hooking into parser events.
   * @returns The fully parsed arguments or null if help was requested.
   */
  static parse = async <O extends ParserConfig>(
    argv: string[],
    options: O,
    event: Event,
  ): Promise<ParsedArgs | null> => {
    const parser = new Parser(argv, options.startIndex || 2, event)

    parser.createScope(options)

    if (options.usageReporter) {
      parser.event.on("help", async () => await options.usageReporter?.(new Command(options)))
    }

    while (parser.hasNext()) {
      const token = parser.current()
      const entry = parser.search(token)

      if (parser.hasHelpFlag()) {
        parser.event.emitLast("help")
        return null
      }

      if (!token) {
        break
      }

      if (entry instanceof Flag) {
        await parser.parseFlag(entry, parser)
        continue
      }

      if (entry instanceof Command) {
        await parser.parseCommand(entry, parser, options)
        continue
      }

      throw CliError.unknownCommandOrFlag(token)
    }

    parser.validateAll(parser.parsedArgs)

    return parser.value
  }

  async parseFlag(entry: Flag, parser: Parser) {
    const value = await entry.parser?.call(parser, entry)?.catch((err: Error) => {
      throw CliError.failedToParseFlag(entry.name, err?.message)
    })

    if (value != null) {
      parser.set(entry.name, value)
      parser.incrementIndex()
      return
    }

    throw CliError.missingRequiredFlag(entry.name)
  }

  async parseCommand(entry: Command, parser: Parser, options: ParserConfig) {
    parser.updateScope(entry)
    parser.incrementIndex()

    if (entry.action) {
      parser.event.on("run", async () => await entry.action?.(parser.value, entry.name))
    }

    parser.event.on("help", async () => await (entry.usageReporter ?? options.usageReporter)?.(entry))
  }
}

// === Default Parser Function ===
export const defaultParser: ParserFn = async function () {
  throw CliError.missingImplementation()
}

// === Flag Class Definition ===
export class Flag<T = any> {
  public readonly type: string
  public readonly name: string
  public readonly description: string
  public readonly required: boolean
  public readonly default?: T
  public readonly alias?: string | string[]
  public readonly parser: ParserFn<T>
  public readonly prefix: string
  public readonly aliasPrefix: string

  // Initialize flag properties
  constructor(config: FlagConstructorConfig<T>) {
    this.type = config.type
    this.name = config.name
    this.description = config.description
    this.required = config.required || false
    this.default = config.default
    this.alias = config.alias
    this.parser = config.parser || defaultParser
    this.prefix = config.prefix || "--"
    this.aliasPrefix = config.aliasPrefix || "-"
  }
}

// === Command Class Implementation ===
export class Command {
  public readonly type = "command"
  public readonly name: string
  public readonly description: string
  public readonly alias?: string | string[]
  public readonly required: boolean
  public readonly flags?: Flag[]
  public readonly commands?: Command[]
  public readonly action?: CommandAction
  public readonly usageReporter?: UsageReporter
  public readonly prefix: string
  public readonly aliasPrefix: string

  // Initialize command properties
  constructor(config: CommandConfig) {
    this.name = config.name
    this.description = config.description
    this.required = config.required || false
    this.alias = config.alias
    this.flags = config.flags
    this.commands = config.commands
    this.action = config.action
    this.usageReporter = config.usageReporter
    this.prefix = config.prefix || ""
    this.aliasPrefix = config.aliasPrefix || ""
  }
}

/**
 * Creates a new Flag instance with the given type and parser function.
 * @param type - The type of flag to create.
 * @param parser - The parser function to use for flag parsing.
 * @returns A new Flag instance with the given type and parser.
 */
export const createFlag =
  <T>(type: string, parser: ParserFn<T>) =>
  (config: FlagConfig<T>) =>
    new Flag<T>({ ...config, type, parser })
