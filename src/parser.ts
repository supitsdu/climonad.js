import { Cmd, flatEntries } from "./commands"
import { Option } from "./options"
import type { ParsedArgs } from "./types"
import { Utils } from "./utils"

export interface ParserOptions {
	options: Option[]
	commands: Cmd[]
}

export type Entries = Map<string, Option | Cmd>

/**
 * A command-line argument parser that handles options and commands.
 *
 * The Parser class provides functionality to:
 * - Parse command line arguments into structured data
 * - Validate option values
 * - Handle command and subcommand hierarchies
 * - Provide descriptive error messages for unknown inputs
 *
 * @throws {Error} When initialization fails due to invalid configuration
 */
export class Parser {
	private readonly globalEntries: Map<string, Option | Cmd>
	private entries: Entries = new Map()

	constructor(parserOptions: ParserOptions) {
		this.globalEntries = new Map()
		flatEntries(parserOptions.options, parserOptions.commands, this.globalEntries)
	}

	public parse(args: string[]): ParsedArgs {
		this.entries = this.globalEntries
		const indices = new Set<number>()
		const data = { commands: new Set(), options: new Map(), actions: new Map() } as ParsedArgs

		for (const [index, arg] of args.entries()) {
			if (indices.has(index)) continue

			const entry = this.getEntry(arg)

			if (entry instanceof Option) {
				const validatedValue = this.validateOption(entry, args[index + 1], indices, index)
				data.options.set(entry.name, validatedValue)
				continue
			}

			if (entry instanceof Cmd && this.entries.has(arg)) {
				data.commands.add(entry.name)
				this.setLocalEntries(entry.entries)
				this.setFn(entry.name, entry.fn, data)
				continue
			}

			const closest = Utils.closestString(arg, this.entries.keys())

			if (closest) {
				throw new Error(`Unknown command or option "${arg}". Did you mean "${closest}"?`)
			}

			throw new Error(`Unknown command or option "${arg}"`)
		}

		this.resetEntries()
		return data
	}

	private getEntry(flag: string): Option | Cmd | undefined {
		return this.entries.get(flag) ?? this.globalEntries.get(flag)
	}

	private setLocalEntries(localEntries: Entries) {
		if (localEntries.size) this.entries = localEntries
	}

	private resetEntries() {
		this.entries = new Map()
	}

	private setFn(flag: string, fn: ((data: ParsedArgs) => void) | undefined, data: ParsedArgs) {
		if (fn) data.actions.set(flag, (d: ParsedArgs = data) => fn(d))
	}

	private isNextArgumentAnOption(nextArg: string | undefined): boolean {
		return Boolean(nextArg && (this.entries.has(nextArg) || this.globalEntries.has(nextArg)))
	}

	private shouldIncludeNextIndex(validatedValue: any, nextArg: string | undefined): boolean {
		return validatedValue !== undefined && nextArg !== undefined
	}

	private getEffectiveValue(entry: Option, validatedValue: any): any {
		return entry.default !== undefined && entry.isEmptyValue(validatedValue) ? entry.default : validatedValue
	}

	private validateOption(option: Option, nextArgument: string | undefined, indices: Set<number>, index: number): any {
		const nextArg = this.isNextArgumentAnOption(nextArgument) ? undefined : nextArgument
		const validatedValue = this.getEffectiveValue(option, option.validate(nextArg))

		if (this.shouldIncludeNextIndex(validatedValue, nextArg)) {
			indices.add(index + 1)
		}

		if (option.required && option.isEmptyValue(validatedValue)) {
			throw new Error(`Option "${option.name}" requires a value`)
		}

		return validatedValue
	}
}
