import { describe, expect, it } from "vitest"
import { Flags } from "../src/flags"
import type { FlagConfig } from "../src/types"

describe("Flags.TypedFlag", () => {
	const basicConfig: FlagConfig = {
		name: "test",
		flag: "--test",
		description: "test flag",
	}

	it("should initialize correctly with basic configuration", () => {
		const flag = new Flags.TypedFlag(basicConfig, v => String(v))

		expect(flag.name).toBe("test")
		expect(flag.flag).toBe("--test")
		expect(flag.description).toBe("test flag")
		expect(flag.type).toBe("string")
	})

	it("should validate input when validator is provided", () => {
		const flag = new Flags.TypedFlag(
			basicConfig,
			v => String(v),
			v => typeof v === "string",
		)

		expect(flag.isValid("test")).toBe(true)
		expect(flag.isValid(123)).toBe(false)
	})

	it("should always return true when no validator is provided", () => {
		const flag = new Flags.TypedFlag(basicConfig, v => String(v))

		expect(flag.isValid("test")).toBe(true)
		expect(flag.isValid(123)).toBe(true)
	})

	it("should convert values using provided converter", () => {
		const flag = new Flags.TypedFlag(basicConfig, v => Number(v))

		expect(flag.convert("123")).toBe(123)
	})

	it("should handle default values correctly", () => {
		const flagWithDefault = new Flags.TypedFlag({ ...basicConfig, default: "default" }, v => String(v))

		expect(flagWithDefault.default).toBe("default")
	})
})
