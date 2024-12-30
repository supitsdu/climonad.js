import { Flags } from "./flags"
import type * as Types from "./types"
import { Utils } from "./utils"

export class UsageGenerator {
  /**
   * Creates the default help option flag.
   * @returns A boolean flag representing the help option.
   */
  static createHelpFlag(): Types.Flag {
    return new Flags.TypedFlag<boolean>(
      {
        type: "boolean",
        name: "help",
        flag: "--help",
        description: "Show help",
        alias: "-h",
      },
      () => true,
    )
  }

  constructor(
    private readonly rootCommand: Types.Command,
    private readonly globalFlags: Types.Flag[],
  ) {}

  /**
   * Generates usage information for the current command or root command.
   * @param currentCommand The command to generate help for.
   * @param path The command path leading to the current command.
   * @returns The command usage information.
   */
  generate(currentCommand: Types.Command | null, path: string[]): Types.CommandUsage {
    return currentCommand ? this.generateCommandHelp(currentCommand, path) : this.generateRootHelp()
  }

  /**
   * Generates usage information for the root command.
   * @returns The usage information for the root command.
   */
  private generateRootHelp(): Types.CommandUsage {
    return {
      name: this.rootCommand.name,
      description: this.rootCommand.description,
      flags: this.formatFlags(this.globalFlags),
    }
  }

  /**
   * Generates usage information for a specific command.
   * @param command The command to generate help for.
   * @param path The command path leading to the command.
   * @returns The command usage information.
   */
  private generateCommandHelp(command: Types.Command, path: string[]): Types.CommandUsage {
    const commandPath = this.getCommandPath(command, path)
    const commandFlags = this.getCommandFlags(command)

    return {
      name: commandPath,
      description: command.description,
      commands: this.formatCommands(command.commands),
      flags: this.formatFlags(commandFlags),
    }
  }

  /**
   * Constructs the full command path as a string.
   * @param command The command to get the path for.
   * @param path The command path leading to the command.
   * @returns The full command path.
   */
  private getCommandPath(command: Types.Command, path: string[]): string {
    return path.length ? path.join(" ") : command.name
  }

  /**
   * Retrieves all options for a command, combining command-specific options with global options.
   * @param command The command to get options for.
   * @returns An array of flags applicable to the command.
   */
  private getCommandFlags(command: Types.Command): Types.Flag[] {
    const commandFlags = command.flags || []
    return [...commandFlags.filter((f) => !this.globalFlags.includes(f)), ...this.globalFlags]
  }

  /**
   * Formats a list of commands into CommandInfo objects for display.
   * @param commands The list of commands to format.
   * @returns An array of formatted command information.
   */
  private formatCommands(commands?: Types.Command[]): Types.CommandInfo[] | undefined {
    return commands?.map((cmd) => ({
      name: cmd.name,
      flag: cmd.name,
      alias: cmd.alias,
      description: cmd.description,
    }))
  }

  /**
   * Formats a list of options into FlagInfo objects for display.
   * @param options The list of options to format.
   * @returns An array of formatted flag information.
   */
  private formatFlags(flags: Types.Flag[]): Types.FlagInfo[] {
    return flags.map((opt) => ({
      name: Utils.formatFlag(opt.flag, opt.alias),
      alias: opt.alias,
      type: opt.type,
      description: opt.description,
      flag: opt.flag,
      multiple: opt.multiple,
    }))
  }
}
