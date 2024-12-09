/**
 * Configuration object for defining command line options.
 * Used when creating new option instances like Bool, Str, or Num.
 * @since 0.1.0
 */
export interface OptionConfig {
	/** Full name of the option (e.g., "verbose" for --verbose) */
	name: string
	/** Single character alias (e.g., "v" for -v) */
	alias: string
	/** Description displayed in help text */
	description: string
	/** Default value if option is not provided */
	defaultValue?: any
	/** Whether the option must be provided */
	required?: boolean
	/** Callback function executed when option is used */
	fn?: (data: CliData) => void
	/** Number of values expected for this option */
	totalValues?: number
}

/**
 * Contains the parsed state of the CLI after processing arguments.
 * This is returned by the Cli.run() method.
 * @since 0.1.0
 */
export interface CliData {
	/** Map of option names to their parsed values */
	options: Map<string, any>
	/** Map of command names that were triggered */
	commands: Map<string, boolean>
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
	command: Map<string, boolean>
	/** Map of parsed option values */
	options: Map<string, any>
	/** Set of callback functions to execute */
	callstack: Set<(data: CliData) => void>
}
