import { CLIParser, CLIRegistry } from "./core"
import { CLIError, CLIErrorHandler } from "./errors"
import { CLINode } from "./nodes"
import { CLIAction, CLIDefinition } from "./types"
import { CLIHelpConstructor, HelpReporter } from "./ui"

export interface CLIOptions extends CLIDefinition {
  help?: boolean | string
  helpReporter?: HelpReporter
  errorHandler?: CLIErrorHandler
}

export interface CLIConstructorOptions extends CLIOptions {
  registry: CLIRegistry
}

export class CLI<FlagTypes extends Record<string, unknown> = Record<string, unknown>> extends CLINode {
  private readonly helpToken: string
  public readonly helpReporter: HelpReporter

  constructor(options: CLIConstructorOptions) {
    const errorHandler = options.errorHandler || new CLIErrorHandler()
    super(options.registry, null, errorHandler)
    this.registry.initialize(options)
    this.helpToken = typeof options.help === "string" ? options.help : "help"
    this.helpReporter =
      options.helpReporter ||
      (() => {
        throw this.errorHandler.create("CLI_HELP_REPORTER_NOT_SET")
      })
  }

  public async parse(input: string[]): Promise<{
    flags: Map<string & keyof FlagTypes, unknown>
    actions: CLIAction[]
    help: CLIHelpConstructor | null
  }> {
    const parser = new CLIParser(this.registry, this.errorHandler)
    const tokens = await parser.resolveTokens(input)
    const indices = tokens.populateDefaults().enforceRequirements().current

    const flags = new Map<string & keyof FlagTypes, unknown>()

    let lastCommand = 0
    let reportHelp = false

    const actions: CLIAction[] = []

    for (const index of indices) {
      const entry = this.registry.nodes[index]

      if (entry.name === this.helpToken) {
        reportHelp = true
      }

      if (entry.kind === "flag") {
        flags.set(entry.name as string & keyof FlagTypes, entry.value ?? entry.default)
      }

      if (entry.kind === "command" && entry.action) {
        actions.push(entry.action)
        lastCommand = entry.index
      }
    }

    return {
      flags,
      actions,
      help: reportHelp ? new CLIHelpConstructor(this.registry, lastCommand) : null,
    }
  }

  public async run(input: string[]) {
    try {
      if (!Array.isArray(input)) {
        throw this.errorHandler.create("CLI_INVALID_INPUT")
      }

      const { flags, actions, help } = await this.parse(input)

      if (help !== null) {
        try {
          return await this.helpReporter(help)
        } catch (helpError) {
          throw this.errorHandler.create("CLI_HELP_DISPLAY_FAILED", helpError)
        }
      }

      if (!actions.length) {
        throw this.errorHandler.create("CLI_NO_ACTION_FOUND")
      }

      for (let idx = 0; idx < actions.length; idx++) {
        try {
          await actions[idx](flags)
        } catch (actionError) {
          throw this.errorHandler.create("CLI_ACTION_FAILED", actionError)
        }
      }
    } catch (e) {
      if (e instanceof CLIError) {
        throw e
      }
      throw this.errorHandler.create("CLI_INPUT_PROCESSING_FAILED", e)
    }
  }
}

export const createCLI = <FlagTypes extends Record<string, unknown> = Record<string, unknown>>(
  options: CLIOptions | CLI<FlagTypes>,
): CLI<FlagTypes> => {
  if (options instanceof CLI) return options as CLI<FlagTypes>
  return new CLI<FlagTypes>({ ...options, registry: new CLIRegistry() })
}
