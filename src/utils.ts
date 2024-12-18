export namespace Utils {
	/**
	 * Determines if a value is a valid boolean representation.
	 * Accepts boolean values or strings "true", "false", "1", "0".
	 */
	export function isValidBoolean(value: unknown): boolean {
		return typeof value === "boolean" || ["true", "false", "1", "0"].includes(String(value))
	}

	/**
	 * Checks if a value is a valid number within an optional range.
	 * Converts the value to a number and checks if it's not NaN and within the specified min and max.
	 */
	export function isValidNumber(value: unknown, min?: number, max?: number): boolean {
		const num = Number(value)
		if (isNaN(num)) return false
		if (min !== undefined && num < min) return false
		if (max !== undefined && num > max) return false
		return true
	}

	/**
	 * Converts a value to a boolean.
	 * Returns true for boolean true, or strings "true", "1"; otherwise false.
	 */
	export function toBooleanValue(value: unknown): boolean {
		if (typeof value === "boolean") return value
		return ["true", "1"].includes(String(value))
	}

	// String formatting utilities

	/**
	 * Formats a flag string by combining primary and secondary flags.
	 * If a secondary flag is provided, returns "primary, secondary"; otherwise just "primary".
	 */
	export function formatFlag(primary: string, secondary?: string): string {
		return secondary ? `${primary}, ${secondary}` : primary
	}
}
