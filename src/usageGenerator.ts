import type * as Types from "./types"
import { Flags } from "./flags"
import { Utils } from "./utils"

export class UsageGenerator {
	/**
	 * Creates the default help option flag.
	 * @returns A boolean flag representing the help option.
	 */
	static createHelpOption(): Types.Flag {
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
		private readonly globalOptions: Types.Flag[],
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
			flags: this.formatOptions(this.globalOptions),
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
		const commandOptions = this.getCommandOptions(command)

		return {
			name: commandPath,
			description: command.description,
			commands: this.formatCommands(command.commands),
			flags: this.formatOptions(commandOptions),
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
	private getCommandOptions(command: Types.Command): Types.Flag[] {
		const commandOptions = command.options || []
		return [...commandOptions.filter(opt => !this.globalOptions.includes(opt)), ...this.globalOptions]
	}

	/**
	 * Formats a list of commands into CommandInfo objects for display.
	 * @param commands The list of commands to format.
	 * @returns An array of formatted command information.
	 */
	private formatCommands(commands?: Types.Command[]): Types.CommandInfo[] | undefined {
		return commands?.map(cmd => ({
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
	private formatOptions(options: Types.Flag[]): Types.FlagInfo[] {
		return options.map(opt => ({
			name: Utils.formatFlag(opt.flag, opt.alias),
			alias: opt.alias,
			type: opt.type,
			description: opt.description,
			flag: opt.flag,
		}))
	}
}
