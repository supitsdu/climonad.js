/**
 * Contains the parsed state of the CLI after processing arguments.
 * This is returned by the Cli.run() method.
 * @since 0.1.0
 */
export interface CliData {
	/** Map of option names to their parsed values */
	options: Map<string, any>
	/** Map of command names that were triggered */
	commands: Set<string>
	/** Error that occurred during parsing, if any */
	error?: Error
}

/**
 * Internal interface representing the intermediate parsing state.
 * Used by the parser function to track commands, options and callbacks.
 * @internal
 */
export interface ParsedArgs {
	/** Map of triggered command names */
	commands: Set<string>
	/** Map of parsed option values */
	options: Map<string, any>
	/** Set of callback functions to execute */
	actions: Map<string, (data?: ParsedArgs) => void>
}
