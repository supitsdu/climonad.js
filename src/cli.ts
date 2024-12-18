import { Flags } from "./flags"
import { Parser } from "./parser"
import * as Types from "./types"
import { UsageGenerator } from "./usageGenerator"
import { Utils } from "./utils"

export class CliError extends Error {
	constructor(
		message: string,
		public code?: string,
	) {
		super(message)
		this.name = "CliError"
	}
}

export namespace Cli {
	export namespace Core {
		export interface ParseResult {
			/**
			 * Set of commands parsed from the input arguments.
			 */
			commands: Set<string>

			/**
			 * Map of option names to their parsed values.
			 */
			options: Map<string, any>

			/**
			 * Generates a help message for the current command.
			 * @returns Command usage information or `null` if help was not requested.
			 */
			generateHelp: () => Types.CommandUsage | null
		}
	}

	/**
	 * Manages the setup and parsing of CLI commands and flags.
	 */
	export class Setup {
		private readonly tree = new Parser.Tree<Types.Command | Types.Flag>()
		private readonly scopeCache = new Map<string, Parser.Scope>()
		private readonly rootCommand: Types.Command
		private readonly helpOption: Types.Flag
		private readonly globalOptions: Types.Flag[]
		private readonly usageGenerator: UsageGenerator

		/**
		 * Initializes the CLI setup with the given configuration.
		 * @param config - The CLI configuration object.
		 */
		constructor(config: Types.CliConfig) {
			this.helpOption = UsageGenerator.createHelpOption()
			this.globalOptions = [...(config.options || []), this.helpOption]
			this.rootCommand = new Types.Command({
				...config,
				options: this.globalOptions,
			})

			this.globalOptions.forEach(opt => this.tree.insert(opt.flag, opt))
			this.rootCommand.commands?.forEach(cmd => {
				this.tree.insert(cmd.name, cmd)
				if (cmd.alias) this.tree.insert(cmd.alias, cmd)
			})

			this.usageGenerator = new UsageGenerator(this.rootCommand, this.globalOptions)
		}

		/**
		 * Parses CLI arguments.
		 * @param args - The command-line arguments to parse.
		 * @returns A `ParseResult` object containing commands, options, errors, and help generation.
		 */
		parse(args: string[]): Core.ParseResult {
			const result: Core.ParseResult = {
				commands: new Set<string>(),
				options: new Map<string, any>(),
				generateHelp: () => null,
			}

			let scope: Parser.Scope | null = null
			let currentCommand: Types.Command | null = this.rootCommand
			let helpRequested = false
			const seenFlags = new Set<string>()

			for (let i = 0; i < args.length; i++) {
				const arg = args[i]

				const entry = scope?.search(arg) ?? this.tree.search(arg)

				if (!entry) {
					throw new CliError(
						`Unknown argument '${arg}'. Use '--help' to see available commands and options.`,
						"UNKNOWN_ARGUMENT",
					)
				}

				if (entry instanceof Types.Command) {
					result.commands.add(arg)
					currentCommand = entry
					scope = this.scope(arg)
				} else if (entry instanceof Types.Flag) {
					seenFlags.add(entry.flag)
					if (entry === this.helpOption) {
						helpRequested = true
						break
					}

					const values = []
					while (args[i + 1] && !args[i + 1].startsWith("-")) {
						i++
						const nextArg = args[i]
						if (!entry.isValid(nextArg)) {
							throw new CliError(
								`Invalid value '${nextArg}' for option '${entry.name}'. Expected type: ${entry.type}.`,
								"INVALID_OPTION_VALUE",
							)
						}
						values.push(entry.convert(nextArg))
						if (!entry.multiple) {
							break
						}
					}

					if (values.length === 0) {
						if (entry.default !== undefined) {
							result.options.set(entry.name, entry.default)
						} else if (entry.type === "boolean") {
							result.options.set(entry.name, true)
						} else {
							throw new CliError(
								`Missing value for option '${entry.name}'. Expected type: ${entry.type}.`,
								"MISSING_OPTION_VALUE",
							)
						}
					} else {
						const value = entry.multiple ? values : values[0]
						result.options.set(entry.name, value)
					}
				}
			}

			this.applyDefaultValues(result, currentCommand, seenFlags)

			result.generateHelp = () =>
				helpRequested ? this.usageGenerator.generate(currentCommand, Array.from(result.commands)) : null

			return result
		}

		/**
		 * Applies default values to flags that were not provided.
		 * @param result - The ParseResult object to update.
		 * @param currentCommand - The current command being processed.
		 * @param seenFlags - The set of flags that have been encountered.
		 */
		private applyDefaultValues(result: Core.ParseResult, currentCommand: Types.Command | null, seenFlags: Set<string>) {
			const allFlags = [...(currentCommand?.options || []), ...this.globalOptions]
			for (const flag of allFlags) {
				if (!seenFlags.has(flag.flag) && flag.default !== undefined) {
					result.options.set(flag.name, flag.default)
				}
			}
		}

		/**
		 * Retrieves or creates a scope object for a command.
		 * @param commandName - The name of the command to retrieve the scope for.
		 * @returns The scope associated with the command.
		 */
		private scope(commandName: string): Parser.Scope {
			if (this.scopeCache.has(commandName)) {
				return this.scopeCache.get(commandName)!
			}
			const command = this.tree.search(commandName)
			const scope = new Parser.Scope(command as Types.Command)
			this.scopeCache.set(commandName, scope)
			return scope
		}
	}

	/**
	 * Creates a new CLI setup instance.
	 * @param config - The CLI configuration object.
	 * @returns A new instance of `Setup`.
	 */
	export const createCli = (config: Types.CliConfig): Setup => new Setup(config)

	/**
	 * Creates a new command instance.
	 * @param config - The configuration for the command.
	 * @returns A new `Command` instance.
	 */
	export const cmd = (config: Types.CommandConfig): Types.Command => new Types.Command(config)

	/**
	 * Creates a string flag.
	 * @param config - The configuration for the flag.
	 * @param pattern - Optional regex to validate the flag value.
	 * @returns A new string `TypedFlag` instance.
	 */
	export const str = (config: Types.FlagConfig, pattern?: RegExp) =>
		new Flags.TypedFlag<string>(
			{ ...config, type: "string" },
			value => String(value),
			value => typeof value === "string" && (!pattern || pattern.test(value as string)),
		)

	/**
	 * Creates a boolean flag.
	 * @param config - The configuration for the flag.
	 * @returns A new boolean `TypedFlag` instance.
	 */
	export const bool = (config: Types.FlagConfig) =>
		new Flags.TypedFlag<boolean>(
			{ ...config, type: "boolean" },
			value => Utils.toBooleanValue(value),
			value => Utils.isValidBoolean(value),
		)

	/**
	 * Creates a number flag.
	 * @param config - The configuration for the flag.
	 * @param min - Optional minimum value for the flag.
	 * @param max - Optional maximum value for the flag.
	 * @returns A new number `TypedFlag` instance.
	 */
	export const num = (config: Types.FlagConfig, min?: number, max?: number) =>
		new Flags.TypedFlag<number>(
			{ ...config, type: "number" },
			value => Number(value),
			value => Utils.isValidNumber(value, min, max),
		)
}
