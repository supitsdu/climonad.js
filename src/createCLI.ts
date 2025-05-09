import { CLIRegistry } from "./core"
import { CLIError, CLIErrorHandler } from "./errors"
import { parseInputToTokens, processTokens } from "./helpers/cli-helpers"
import { CLINode } from "./nodes"
import { CLIAction, CLIDefinition } from "./types"
import { CLIHelpConstructor } from "./ui"
import { CLIHelp } from "./ui/help"

export interface CLIOptions extends CLIDefinition {
  help?: CLIHelp
  errorHandler?: CLIErrorHandler
}

export interface CLIConstructorOptions extends CLIOptions {
  registry: CLIRegistry
}

export class CLI<FlagTypes extends Record<string, unknown> = Record<string, unknown>> extends CLINode {
  public readonly help: CLIHelp | null

  constructor(options: CLIConstructorOptions) {
    const errorHandler = options.errorHandler || new CLIErrorHandler()
    super(options.registry, null, errorHandler)
    this.registry.initialize(options)
    this.help = options.help || null
  }

  registerHelp(cliHelp: CLIHelp | null = null) {
    const help = cliHelp ?? this.help

    if (help === null) return null

    if (help.kind === "flag") {
      this.flag(help.def)
    } else if (help.kind === "command") {
      this.cmd(help.def)
    } else {
      return null
    }

    return this
  }

  public async parse(input: string[]): Promise<{
    flags: Map<string & keyof FlagTypes, unknown>
    actions: CLIAction[]
    help: CLIHelpConstructor | null
  }> {
    const helpRegistered = this.registerHelp()
    const tokens = await parseInputToTokens(input, this.registry, this.errorHandler)
    const { flags, actions, shouldShowHelp, lastCommandIndex } = processTokens<FlagTypes>(tokens, this.registry, {
      instance: helpRegistered,
      def: this.help?.def,
    })

    return {
      flags,
      actions,
      help: shouldShowHelp ? new CLIHelpConstructor(this.registry, lastCommandIndex) : null,
    }
  }

  public async run(input: string[]) {
    try {
      this.validateInput(input)
      const { flags, actions, help } = await this.parse(input)

      if (help !== null) {
        return await this.displayHelp(help)
      }

      this.ensureActionsExist(actions)
      await this.executeActions(actions, flags)
    } catch (e) {
      this.handleError(e)
    }
  }

  private validateInput(input: unknown) {
    if (!Array.isArray(input)) {
      throw this.errorHandler.create("CLI_INVALID_INPUT")
    }
  }

  private ensureActionsExist(actions: CLIAction[]) {
    if (!actions.length) {
      throw this.errorHandler.create("CLI_NO_ACTION_FOUND")
    }
  }

  private async displayHelp(helpConstructor: CLIHelpConstructor) {
    try {
      return await this.help?.reporter(helpConstructor)
    } catch (helpError) {
      throw this.errorHandler.create("CLI_HELP_DISPLAY_FAILED", helpError)
    }
  }

  private async executeActions(actions: CLIAction[], flags: Map<string & keyof FlagTypes, unknown>) {
    for (const action of actions) {
      try {
        await action(flags)
      } catch (actionError) {
        throw this.errorHandler.create("CLI_ACTION_FAILED", actionError)
      }
    }
  }

  private handleError(error: unknown) {
    if (error instanceof CLIError) {
      throw error
    }
    throw this.errorHandler.create("CLI_INPUT_PROCESSING_FAILED", error)
  }
}

export const createCLI = <FlagTypes extends Record<string, unknown> = Record<string, unknown>>(
  options: CLIOptions | CLI<FlagTypes>,
): CLI<FlagTypes> => {
  if (options instanceof CLI) return options as CLI<FlagTypes>
  return new CLI<FlagTypes>({ ...options, registry: new CLIRegistry() })
}
