import type { Cmd } from "./commands"
import type { Option } from "./options"
import { parser } from "./parser"
import type { CliData } from "./types"

export interface CliConfig {
	name: string
	description: string
	commands?: Cmd[]
	options?: Option[]
}

/**
 *
 * The `Cli` class parses the command line arguments and executes the appropriate command.
 *
 * @warning This is an **early development version** and is not recommended for production use.
 * The API may change without notice.
 *
 * @example
 * ```js
 * const cli = new Cli({
 * 	name: "my-cli",
 * 	description: "My CLI application",
 * 	commands: [
 * 		new Cmd({
 * 			name: "init",
 * 			description: "Initialize the application",
 * 			alias: "i",
 * 			fn: (data) => console.log("Initializing..."),
 * 		}),
 * 	],
 * 	options: [
 * 		new Bool({
 * 			name: "verbose",
 * 			alias: "v",
 * 			description: "Enable verbose output",
 * 		}),
 * 	]
 * })
 *
 * const data = cli.run(process.argv.slice(2))
 * ```
 * @since 0.1.0
 */
export class Cli {
	name: string
	description: string
	commands: Map<string, Cmd>
	options: Map<string, Option>

	constructor(config: CliConfig) {
		this.name = config.name
		this.description = config.description
		this.commands = new Map()
		this.options = new Map()

		if (Array.isArray(config.commands)) {
			for (const command of config.commands) {
				for (const key of command.keys) {
					if (this.commands.has(key)) {
						throw new Error(`Duplicate command key: ${key}`)
					}
					this.commands.set(key, command)
				}
			}
		}

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

	/**
	 * Run the CLI application with the given arguments.
	 *
	 * ```js
	 * // Run the CLI with the command line arguments
	 * cli.run(process.argv.slice(2))
	 * ```
	 * @param args - The command line arguments to parse.
	 * @returns The parsed CLI data.
	 * @since 0.1.0
	 */
	run(args: string[]): CliData {
		let data: CliData = { options: new Map(), commands: new Map() }
		try {
			const parsedArgs = parser(args, {
				options: this.options,
				commands: this.commands,
			})

			data = {
				options: parsedArgs.options,
				commands: parsedArgs.command,
			}

			for (const fn of parsedArgs.callstack) {
				fn?.(data)
			}
		} catch (error) {
			data.error = error as Error
		}

		return data
	}
}
