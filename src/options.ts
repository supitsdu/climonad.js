import { Utils } from "./utils"

/**
 * Configuration object for defining command line options.
 * Used when creating new option instances like Bool, Str, or Num.
 * @since 0.1.0
 */
export interface OptionConfig {
	/** Full name of the option (e.g., "verbose" for --verbose) */
	name: string
	/** Single character alias (e.g., "v" for -v) */
	alias?: string
	aliases?: string[]
	/** Description displayed in help text */
	description?: string
	/** Default value if option is not provided */
	default?: any
	/** Whether the option must be provided */
	required?: boolean
	/** Number of values expected for this option */
	totalValues?: number
}
/**
 * The `Option` class is the base class for defining command line options.
 * It provides a common interface for defining and parsing options.
 *
 * @warning This is an **early development version** and is not recommended for production use.
 * The API may change without notice.
 *
 * @abstract
 * @since 0.1.0
 */
export class Option {
	name: string
	flag: string
	aliases?: string[]
	default: any
	totalValues?: number
	description: string
	required: boolean
	type?: string
	parent?: string

	constructor(config: OptionConfig) {
		this.name = config.name
		this.flag = `--${config.name}`
		this.aliases = Utils.mergeAliases([config.alias, ...(config.aliases ?? [])], flag => `-${flag}`)
		this.default = config.default
		this.totalValues = config.totalValues
		this.description = config.description ?? ""
		this.required = config.required || false
	}

	isEmptyValue(value: any): boolean {
		return value === undefined || value === null || value === ""
	}

	validate(_: any): any {
		throw new Error("Method not implemented.")
	}
}

/**
 * Use `Bool` to define a `boolean` option.
 *
 * @warning This is an **early development version** and is not recommended for production use.
 * The API may change without notice.
 *
 * @example
 * ```js
 * const verbose = new Bool({
 * 	name: "verbose",
 * 	alias: "v",
 * 	description: "Enable verbose output",
 * 	default: false,
 * })
 *
 * // $ mycli --verbose
 * // $ mycli -v
 * ```
 * @since 0.1.0
 */
export class Bool extends Option {
	constructor(options: OptionConfig) {
		super(options)
		this.type = "boolean"
	}

	override validate(input?: string | boolean): boolean {
		if (this.isEmptyValue(input)) return this.default ?? true

		return `${input}` === "true" ? true : `${input}` === "false" ? false : (this.default ?? undefined)
	}
}

/**
 * Use `Str` to define a `string` option.
 *
 * @warning This is an **early development version** and is not recommended for production use.
 * The API may change without notice.
 *
 * @example
 * ```js
 * const name = new Str({
 * 	name: "name",
 * 	alias: "n",
 * 	description: "Your name",
 * 	required: true,
 * })
 *
 * // $ mycli --name "Alice"
 * // $ mycli -n "Alice"
 * ```
 * @since 0.1.0
 */
export class Str extends Option {
	constructor(options: OptionConfig) {
		super(options)
		this.type = "string"
	}

	override validate(value?: string): string {
		return !this.isEmptyValue(value) ? value : this.default
	}
}

/**
 * Use `Num` to define a `number` option.
 *
 * @warning This is an **early development version** and is not recommended for production use.
 * The API may change without notice.
 *
 * @example
 * ```js
 * const count = new Num({
 * 	name: "count",
 * 	alias: "c",
 * 	description: "Number of items",
 * 	default: 0,
 * })
 *
 * // $ mycli --count 10
 * // $ mycli -c 10
 * ```
 * @since 0.1.0
 */
export class Num extends Option {
	constructor(options: OptionConfig) {
		super(options)
		this.type = "number"
	}

	override validate(input?: string | number): boolean {
		const value = input ?? (this.required ? undefined : (this.default ?? 0))
		const result = Number(value)

		return isNaN(result) ? this.default : result
	}
}
