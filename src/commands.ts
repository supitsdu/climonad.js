import type { Option } from "./options"
import type { CliData } from "./types"

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
	alias: string
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
	/**
	 * The description of the command.
	 */
	description: string
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
 * 	name: "help",
 * 	alias: "h",
 * 	description: "Display help information",
 * 	options: [
 * 		new Bool({
 * 			name: "verbose",
 * 			alias: "v",
 * 			description: "Enable verbose output",
 * 			defaultValue: false,
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
	alias: string
	keys: string[]
	description: string
	options: Map<string, Option>
	fn?: (data: CliData) => void

	constructor(config: CommandConfig) {
		this.name = config.name
		this.alias = config.alias
		this.keys = [`${config.name}`, `${config.alias}`]
		this.description = config.description
		this.options = new Map()
		this.fn = config.fn

		if (Array.isArray(config.options)) {
			for (const option of config.options) {
				for (const key of option.keys) {
					if (this.options.has(key)) {
						throw new Error(`Duplicate option key: ${key}`)
					}
					this.options.set(key, option)
				}
			}
		}
	}
}
