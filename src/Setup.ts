import { Command, ParsedArgs, ParsedCommands, ParsedFlags } from "./Command"
import { Flag } from "./Flag"
import { Scope } from "./Scope"
import { PrimitiveValues } from "./types"

// === Scope Interfaces ===
interface Scopes {
  global: Scope
  current: Scope
}

// === Setup Configuration Interface ===
export interface SetupConfig {
  name: string
  description: string
  flags?: Flag[]
  commands?: Command[]
  onUsageReporter?: (command: Command) => Promise<void> | void
  usageFlag?: string
}

// === Setup Class Definition ===
export class Setup {
  // === Setup Properties ===
  private readonly name: string
  private readonly scopes: Scopes
  private readonly config: SetupConfig
  private latestCommand: string

  // === Constructor Method ===
  constructor(config: SetupConfig) {
    // Initialize setup with configuration and scopes
    this.name = config.name
    this.scopes = { global: new Scope(), current: new Scope() }
    this.latestCommand = this.name
    this.config = config

    // Update the global scope with the initial configuration
    this.updateCommandScope(config, this.scopes.global)
  }

  // === Debugging Methods ===
  public debug() {
    return { global: this.scopes.global.debug(), current: this.scopes.current.debug() }
  }

  // === Default Flag Application ===
  public applyDefaults(scope: Scope, flags: Map<string, PrimitiveValues>) {
    scope.forEachFlagWithDefaultValue((flag) => {
      if (!flags.has(flag.name)) {
        flags.set(flag.name, flag.default)
      }
    })
  }

  // === Requirement Validation Methods ===
  public fromScopeCheckRequirements(scope: Scope, flags: ParsedFlags, commands: ParsedCommands) {
    scope.forEachRequiredFlag((flag) => {
      if (!flags.has(flag.name)) {
        throw new Error(`Missing required flag: ${flag.name}`)
      }
    })

    scope.forEachRequiredCommand((command) => {
      if (!commands.has(command.name)) {
        throw new Error(`Missing required command: ${command.name}`)
      }
    })
  }

  // === Command Action Execution ===
  public async runCommandActions(commands: ParsedCommands, flags: ParsedFlags) {
    for (const [name, action] of commands) {
      if (action) await action({ flags, commands }, name)
    }
  }

  // === Main Execution Method ===
  public async run(argv: string[]): Promise<void> {
    // Parse command-line arguments
    const { flags, commands } = await this.parse(argv)

    // Apply default flag values to current and global scopes
    this.applyDefaults(this.scopes.current, flags)
    this.applyDefaults(this.scopes.global, flags)

    // Handle usage reporting if usage flag is present
    if (this.hasUsageFlag(flags)) {
      return await this.handleUsageReporting()
    }

    // Validate required flags and commands in scopes
    this.fromScopeCheckRequirements(this.scopes.global, flags, commands)
    this.fromScopeCheckRequirements(this.scopes.current, flags, commands)

    // Execute actions associated with parsed commands
    await this.runCommandActions(commands, flags)
  }

  // === Usage Reporting Methods ===
  private async handleUsageReporting(): Promise<void> {
    // Retrieve the latest command or default to the setup configuration
    const command: Command = this.getCmd(this.latestCommand) || new Command(this.config)
    let reporter: Command["onUsageReporter"] | null = null

    // Determine if a usage reporter is available
    if (this.hasUsageReporter(command)) reporter = this.getUsageReporter(command)

    if (!reporter) {
      throw new Error(`No usage reporter found for command: ${this.latestCommand}`)
    }

    // Execute the usage reporter
    await reporter(command)

    return
  }

  private hasUsageReporter(command: Command) {
    return this.scopes.current.hasUsageReporter(command.name) || this.scopes.global.hasUsageReporter(this.name)
  }

  private getUsageReporter(command: Command) {
    return this.scopes.current.getUsageReporter(command.name) || this.scopes.global.getUsageReporter(this.name) || null
  }

  private hasUsageFlag(flags: ParsedFlags) {
    return flags.get(this.config.usageFlag || "help") === true
  }

  // === Flag Management Methods ===
  public hasFlag(key: string): boolean {
    return this.scopes.global.hasFlag(key) || this.scopes.current.hasFlag(key)
  }

  public getFlag(key: string): Flag | null {
    return this.scopes.global.getFlag(key) || this.scopes.current.getFlag(key) || null
  }

  // === Command Management Methods ===
  public hasCmd(key: string): boolean {
    return this.scopes.global.hasCmd(key) || this.scopes.current.hasCmd(key)
  }

  public getCmd(key: string): Command | null {
    return this.scopes.global.getCmd(key) || this.scopes.current.getCmd(key) || null
  }

  // === Argument Parsing Method ===
  public async parse(argv: string[]): Promise<ParsedArgs> {
    const { flags, commands } = { flags: new Map(), commands: new Map() } as ParsedArgs

    // Slice the first two arguments (node and script) and initialize the index
    const tokens = argv.slice(2)
    let i = 0

    // Iterate through each token in the command-line arguments
    while (i < tokens.length) {
      const token = tokens[i]

      // If the usage flag is present, return the current flags and commands
      if (this.hasUsageFlag(flags)) {
        return { flags, commands }
      }

      // Check if the current token is a recognized flag
      if (this.hasFlag(token)) {
        let currentIndex = i + 1 // Move to the next token after the flag
        const flag = this.getFlag(token)!

        try {
          // Bind the parser function to the flag instance
          const parser = flag.parser?.bind(flag)

          const value = await parser({
            next: tokens,
            index: currentIndex,
            setIndex: (index) => {
              currentIndex = index
            },
            hasFlag: (key: string) => this.hasFlag(key),
            hasCmd: (key: string) => this.hasCmd(key),
          })

          if (value != null) {
            flags.set(flag.name, value)

            // Update the index based on the parser's consumption of tokens
            i = currentIndex > i ? currentIndex : i + 1
            continue
          }

          throw new Error(`Invalid value for flag: ${flag.name}`)
        } catch (error) {
          if (error instanceof Error) {
            throw error
          }
          throw new Error(`Error while validating flag: ${flag.name}`)
        }
      }

      // Check if the current token is a recognized command
      if (this.getCmd(token)) {
        const command = this.getCmd(token)!
        commands.set(command.name, command.action)

        // Update the latest command and its scope
        this.latestCommand = token
        this.updateCommandScope(command, this.scopes.current)
        i++
        continue
      }

      throw new Error(`Unknown token: ${token}`)
    }

    return {
      flags,
      commands,
    }
  }

  // === Scope Update Methods ===
  public updateCommandScope(command: Command | SetupConfig, scope: Scope): void {
    const flags = command.flags || []
    const commands = command.commands || []

    for (const flag of flags) scope.addFlag(flag)

    for (const cmd of commands) scope.addCmd(cmd)

    if (typeof command.onUsageReporter === "function") scope.setUsageReporter(command.name, command.onUsageReporter)
  }
}

// === CLI Initialization Function ===
export function cli(config: SetupConfig | Setup) {
  if (config instanceof Setup) return config
  return new Setup(config)
}
