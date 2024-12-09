import type { Cmd } from "./commands"
import type { Option } from "./options"
import type { ParsedArgs } from "./types"

/**
 * Parses command line arguments into a structured format.
 *
 * @internal This function is not intended to be used directly by consumers.
 * @param args Array of command line argument strings to parse
 * @param options Configuration object containing valid options and commands
 * @since v0.1.0
 */
export function parser(
	args: string[],
	{ options, commands }: { options: Map<string, Option>; commands: Map<string, Cmd> },
): ParsedArgs {
	const data: ParsedArgs = {
		command: new Map(),
		options: new Map(),
		callstack: new Set(),
	}

	const usedIndices = new Set<number>()

	for (let i = 0; i < args.length; i++) {
		if (usedIndices.has(i)) continue

		const currentArg = args[i]
		const equalSignIndex = currentArg.indexOf("=")
		const argName = equalSignIndex > -1 ? currentArg.slice(0, equalSignIndex) : currentArg
		const option = options.get(argName)

		if (option) {
			if (data.options.has(option.name)) {
				throw new Error(`Duplicate option: ${option.name}`)
			}

			let optionValue: string | undefined

			if (equalSignIndex > -1) {
				optionValue = currentArg.slice(equalSignIndex + 1)
			} else {
				const nextArg = args[i + 1]
				if (nextArg && !nextArg.startsWith("-")) {
					optionValue = nextArg
					usedIndices.add(i + 1)
					i++
				}
			}

			data.options.set(option.name, option.parse(optionValue))
			if (typeof option?.fn === "function") data.callstack.add(option.fn)
			continue
		}

		const command = commands.get(argName)
		if (command && !usedIndices.has(i)) {
			if (data.command.has(command.name)) {
				throw new Error(`Duplicate command: ${command.name}`)
			}

			if (typeof command?.fn === "function") data.callstack.add(command.fn)

			data.command.set(command.name, true)
			continue
		}

		if (!usedIndices.has(i)) {
			throw new Error(`Invalid argument: ${argName}`)
		}
	}

	for (const [_, option] of options) {
		if (option.required && !data.options.has(option.name)) {
			throw new Error(`Missing required option: ${option.name}`)
		}

		if (!data.options.has(option.name) && "defaultOption" in option) {
			data.options.set(option.name, option.parse(option.defaultValue))
		}
	}

	return data
}
