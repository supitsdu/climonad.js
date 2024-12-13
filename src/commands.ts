import type { Option } from "./options"
import type { CliData } from "./types"
import { Utils } from "./utils"

/**
 * The `CommandConfig` interface represents the configuration object for a command.
 * @since 0.1.0
 */
export interface CommandConfig {
	/**
	 * This is the full name of the command (e.g., "help"). It should be unique across all commands.
	 */
	name: string
	/**
	 * The alias for the command. Usually a single character (e.g., "h" for "help").
	 */
	alias?: string
	aliases?: string[]
	/**
	 * The list of options for the command. Only available within the command scope.
	 * ```js
	 * options: [
	 * 	new Bool({
	 * 		name: "verbose",
	 * 		alias: "v",
	 * 		description: "Enable verbose output",
	 * 		defaultValue: false,
	 * 	}),
	 * ]
	 * ```
	 */
	options?: Option[]
	commands?: Cmd[]
	/**
	 * The description of the command.
	 */
	description?: string
	/**
	 * The action function to execute when the command is called.
	 * ```js
	 * fn: ({ options }) => {
	 * 	console.log(`Hello, ${options.get("name")}`)
	 * }
	 * ```
	 */
	fn?: (data: CliData) => void
}

/**
 * The `Cmd` class is responsible for defining the new command, its options,
 * and the action function to execute.
 *
 * @warning This is an **early development version** and is not recommended for production use.
 * The API may change without notice.
 *
 * @example
 *
 * ```js
 * const help = new Cmd({
 * 	name: "initialize",
 * 	alias: "init",
 * 	description: "Initialize the application",
 * 	options: [
 * 		new Bool({
 * 			flag: "verbose",
 * 			alias: "v",
 * 			description: "Enable verbose output",
 * 			default: false,
 * 		}),
 *	],
 *  fn: ({ options }) => {
 *		console.log(`Hello, ${options.get("name")}`)
 *	},
 *	})
 * ```
 *
 * @since 0.1.0
 */
export class Cmd {
	name: string
	aliases?: string[]
	description: string
	entries: Map<string, Option | Cmd>
	fn?: (data: CliData) => void

	constructor(config: CommandConfig) {
		this.name = config.name
		this.aliases = Utils.mergeAliases([config.alias, ...(config.aliases ?? [])], flag => flag)
		this.description = config.description ?? ""
		this.entries = new Map()
		this.fn = config.fn

		flatEntries(config.options, config.commands, this.entries)
	}
}

/**
 * Populates a map with entries from the provided options and commands arrays.
 *
 * @template O - The type of the option objects.
 * @template C - The type of the command objects.
 *
 * @param {any[] | undefined} option - An array of option objects, each containing a `flag` and optionally `aliases`.
 * @param {any[] | undefined} commands - An array of command objects, each containing a `command` and optionally `aliases`.
 * @param {Map<string, O | C>} entries - A map to be populated with the entries from the options and commands arrays.
 *
 * @remarks
 * This function iterates over the provided `option` and `commands` arrays, adding each entry to the `entries` map.
 * For each option, it adds the entry using the `flag` as the key and also adds entries for each alias if they exist.
 * Similarly, for each command, it adds the entry using the `command` as the key and also adds entries for each alias if they exist.
 */
export function flatEntries<O extends Option, C extends Cmd>(
	option: O[] | undefined,
	commands: C[] | undefined,
	entries: Map<string, O | C>,
): void {
	if (option) {
		for (const opt of option) {
			entries.set(opt.flag, opt)
			if (opt.aliases) {
				for (const alias of opt.aliases) {
					if (alias) entries.set(alias, opt)
				}
			}
		}
	}

	if (commands) {
		for (const cmd of commands) {
			entries.set(cmd.name, cmd)
			if (cmd.aliases) {
				for (const alias of cmd.aliases) {
					if (alias) entries.set(alias, cmd)
				}
			}
		}
	}
}
