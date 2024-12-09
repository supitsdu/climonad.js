import type { CliData, OptionConfig } from "./types"

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
	alias: string
	keys: string[]
	value: any
	defaultValue: any
	totalValues?: number
	description: string
	required: boolean
	fn?: (data: CliData) => void
	type?: string

	constructor(config: OptionConfig) {
		this.name = config.name
		this.alias = config.alias
		this.keys = [`--${config.name}`, `-${config.alias}`]
		this.value = config.defaultValue
		this.defaultValue = config.defaultValue
		this.totalValues = config.totalValues
		this.description = config.description
		this.required = config.required || false
		this.fn = config.fn
	}

	validateValue(value: any): any {
		if (this.required && (value === undefined || value === null || value === "")) {
			throw new Error(`No value provided for required option: ${this.name}`)
		}
		return value
	}

	parse(_?: unknown): unknown {
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
 * 	defaultValue: false,
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

	override parse(input?: string | boolean): boolean {
		if (input === undefined || input === "" || input === null) {
			return true
		}

		const result = input === "true" || input === true ? true : input === "false" || input === false ? false : undefined

		if (result === undefined) {
			throw new Error(`Invalid value for '${this.keys.join(", ")}' option`)
		}

		return this.validateValue(result)
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

	override parse(value?: string): string {
		return this.validateValue(value ?? (this.required ? undefined : (this.defaultValue ?? "")))
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
 * 	defaultValue: 0,
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

	override parse(input?: string | number): number {
		const value = input ?? (this.required ? undefined : (this.defaultValue ?? 0))
		const result = Number(value)

		if (isNaN(result)) {
			throw new Error(`Invalid value for option ${this.name}`)
		}

		return this.validateValue(result)
	}
}
