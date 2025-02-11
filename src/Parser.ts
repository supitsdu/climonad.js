import { CliError } from "./CliError"
import { Event } from "./Event"
import { IntelliScope } from "./Scope"

// === Enhanced Type Definitions ===
export type CommandValue = string
export type FlagValue = string | number | boolean
export type ParsedFlags = Map<string, FlagValue>
export type ParsedCommands = Map<CommandValue, CommandHandler | undefined>
export type ParseResult = { flags: ParsedFlags; commands: ParsedCommands }
export type CommandHandler = (parseResult: ParseResult, commandName: CommandValue) => void | Promise<void>
export type FlagParser<T = FlagValue> = (this: Parser, flag: Flag<T>) => Promise<T | null> | T | null
export type UsageHandler = (command: Command) => Promise<void> | void

// === Discriminated Union Types ===
export type CliEntry = Command | Flag
interface BaseEntry {
  readonly name: string
  readonly description: string
  readonly alias?: string | string[]
  readonly required: boolean
  readonly prefix: string
  readonly aliasPrefix: string
}

// === Configuration Interfaces ===
export interface CommandConfig extends BaseEntry {
  readonly flags?: Flag[]
  readonly commands?: Command[]
  readonly action?: CommandHandler
  readonly usageHandler?: UsageHandler
}

export interface ParserConfig extends CommandConfig {
  readonly startIndex?: number
}

export interface FlagConfig<T> extends BaseEntry {
  readonly default?: T
  readonly parser?: FlagParser<T>
}

export interface FlagConstructorConfig<T> extends FlagConfig<T> {
  readonly type: string
}

// === Class Implementations ===
export class Parser {
  private readonly parseResult: ParseResult
  private readonly scope: IntelliScope
  private readonly argv: string[]
  private index: number
  private readonly event: Event

  constructor(argv: string[], startIndex: number, event: Event) {
    this.scope = new IntelliScope()
    this.argv = argv
    this.index = startIndex
    this.parseResult = { flags: new Map(), commands: new Map() }
    this.event = event
  }

  get result(): ParseResult {
    return this.parseResult
  }

  private setFlagValue(flagName: string, value: FlagValue): void {
    this.parseResult.flags.set(flagName, value)
  }

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

  search(key: string) {
    return this.scope.findEntry(key)
  }

  createScope<T extends { flags?: any[]; commands?: any[] }>(entry: T) {
    this.scope.create(entry.commands, entry.flags)
  }

  updateScope(entry: { commands?: any[]; flags?: any[]; name: string; action?: any }) {
    this.parseResult.commands.set(entry.name, entry.action)
    this.createScope(entry)
  }

  validateAll(parseResult: ParseResult) {
    this.scope.validateAll(parseResult)
  }

  hasHelpFlag() {
    return this.parseResult.flags.has("help")
  }

  static parse = async <T extends ParserConfig>(
    argv: string[],
    config: T,
    event: Event,
  ): Promise<ParseResult | null> => {
    const parser = new Parser(argv, config.startIndex || 2, event)

    parser.createScope(config)

    if (config.usageHandler) {
      parser.event.on("help", async () => await config.usageHandler?.(new Command(config)))
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
        await parser.parseCommand(entry, parser, config)
        continue
      }

      throw CliError.unknownCommandOrFlag(token)
    }

    parser.validateAll(parser.result)

    return parser.result
  }

  private async parseFlag<T>(flag: Flag<T>, parser: Parser): Promise<void> {
    const value = await flag.parser.call(parser, flag)

    if (value != null) {
      this.setFlagValue(flag.name, value as FlagValue)
      this.incrementIndex()
      return
    }

    throw CliError.missingRequiredFlag(flag.name)
  }

  private async parseCommand(command: Command, parser: Parser, config: ParserConfig): Promise<void> {
    parser.updateScope(command)
    parser.incrementIndex()

    if (command.action) {
      parser.event.on("run", async () => await command.action?.(parser.result, command.name))
    }

    parser.event.on("help", async () => await (command.usageHandler ?? config.usageHandler)?.(command))
  }
}

// === Default Parser Function ===
export const defaultParser: FlagParser<any> = async function () {
  throw CliError.missingImplementation()
}

// === Flag Class Definition ===
export class Flag<T = FlagValue> implements BaseEntry {
  public readonly type: string
  public readonly name: string
  public readonly description: string
  public readonly required: boolean
  public readonly default?: T
  public readonly alias?: string | string[]
  public readonly parser: FlagParser<T>
  public readonly prefix: string
  public readonly aliasPrefix: string

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
export class Command implements BaseEntry {
  public readonly type = "command" as const
  public readonly name: string
  public readonly description: string
  public readonly alias?: string | string[]
  public readonly required: boolean
  public readonly flags?: Flag[]
  public readonly commands?: Command[]
  public readonly action?: CommandHandler
  public readonly usageHandler?: UsageHandler
  public readonly prefix: string
  public readonly aliasPrefix: string

  constructor(config: CommandConfig) {
    this.name = config.name
    this.description = config.description
    this.required = config.required || false
    this.alias = config.alias
    this.flags = config.flags
    this.commands = config.commands
    this.action = config.action
    this.usageHandler = config.usageHandler
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
  <T extends FlagValue>(type: string, parser: FlagParser<T>) =>
  (config: FlagConfig<T>): Flag<T> =>
    new Flag<T>({ ...config, type, parser })
