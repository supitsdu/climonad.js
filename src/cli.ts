import type { Cmd } from "./commands"
import type { Option } from "./options"
import { Parser } from "./parser"
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
	private parser: Parser

	constructor(config: CliConfig) {
		this.parser = new Parser({
			options: config.options ?? [],
			commands: config.commands ?? [],
		})
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
		const parsed = this.parser.parse(args)
		let runError: unknown
		try {
			// Execute the command action functions
			parsed.actions.forEach(action => action(parsed))
		} catch (error) {
			runError = error
		}

		return {
			commands: parsed.commands,
			options: parsed.options,
			error: runError as Error,
		}
	}
}
