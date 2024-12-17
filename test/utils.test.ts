import { describe, it, expect } from "vitest"
import { Utils } from "../src/utils"

describe("Utils.isValidBoolean", () => {
	it("returns true for boolean values", () => {
		expect(Utils.isValidBoolean(true)).toBe(true)
		expect(Utils.isValidBoolean(false)).toBe(true)
	})

	it("returns true for valid boolean strings", () => {
		expect(Utils.isValidBoolean("true")).toBe(true)
		expect(Utils.isValidBoolean("false")).toBe(true)
		expect(Utils.isValidBoolean("1")).toBe(true)
		expect(Utils.isValidBoolean("0")).toBe(true)
	})

	it("returns false for invalid values", () => {
		expect(Utils.isValidBoolean("yes")).toBe(false)
		expect(Utils.isValidBoolean("no")).toBe(false)
		expect(Utils.isValidBoolean(1)).toBe(false)
		expect(Utils.isValidBoolean(0)).toBe(false)
		expect(Utils.isValidBoolean(null)).toBe(false)
		expect(Utils.isValidBoolean(undefined)).toBe(false)
	})
})

describe("Utils.isValidNumber", () => {
	it("returns true for valid numbers", () => {
		expect(Utils.isValidNumber(10)).toBe(true)
		expect(Utils.isValidNumber("20")).toBe(true)
	})

	it("returns false for invalid numbers", () => {
		expect(Utils.isValidNumber("abc")).toBe(false)
		expect(Utils.isValidNumber(NaN)).toBe(false)
		expect(Utils.isValidNumber(undefined)).toBe(false)
	})

	it("respects the min and max bounds", () => {
		expect(Utils.isValidNumber(5, 1, 10)).toBe(true)
		expect(Utils.isValidNumber(0, 1, 10)).toBe(false)
		expect(Utils.isValidNumber(11, 1, 10)).toBe(false)
	})
})

describe("Utils.toBooleanValue", () => {
	it("converts valid true representations to true", () => {
		expect(Utils.toBooleanValue(true)).toBe(true)
		expect(Utils.toBooleanValue("true")).toBe(true)
		expect(Utils.toBooleanValue("1")).toBe(true)
	})

	it("converts other values to false", () => {
		expect(Utils.toBooleanValue(false)).toBe(false)
		expect(Utils.toBooleanValue("false")).toBe(false)
		expect(Utils.toBooleanValue("0")).toBe(false)
		expect(Utils.toBooleanValue("no")).toBe(false)
		expect(Utils.toBooleanValue(null)).toBe(false)
		expect(Utils.toBooleanValue(undefined)).toBe(false)
	})
})

describe("Utils.formatFlag", () => {
	it("formats primary and secondary flags", () => {
		expect(Utils.formatFlag("--help", "-h")).toBe("--help, -h")
	})

	it("returns primary flag when secondary is not provided", () => {
		expect(Utils.formatFlag("--version")).toBe("--version")
	})
})
