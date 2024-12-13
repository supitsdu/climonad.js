import { describe, expect, it } from "vitest"
import { Cmd } from "../src/commands"
import { Bool, Num, Str } from "../src/options"
import { Parser } from "../src/parser"

describe("Parser", () => {
	describe("option parsing", () => {
		it("should parse boolean flags", () => {
			const parser = new Parser({ options: [new Bool({ name: "verbose", alias: "v" })], commands: [] })

			const result = parser.parse(["--verbose"])
			expect(result.options.get("verbose")).toBe(true)
		})

		it("should parse string options with values", () => {
			const parser = new Parser({ options: [new Str({ name: "name", alias: "n" })], commands: [] })

			const result = parser.parse(["--name", "john"])
			expect(result.options.get("name")).toBe("john")
		})

		it("should parse number options", () => {
			const parser = new Parser({ options: [new Num({ name: "age", alias: "a" })], commands: [] })

			const result = parser.parse(["--age", "25"])
			expect(result.options.get("age")).toBe(25)
		})

		it("should handle default values", () => {
			const parser = new Parser({ options: [new Str({ name: "name", default: "anonymous" })], commands: [] })

			const result = parser.parse(["--name"])
			expect(result.options.get("name")).toBe("anonymous")
		})
	})

	describe("command parsing", () => {
		it("should parse commands", () => {
			const parser = new Parser({ options: [], commands: [new Cmd({ name: "init" })] })

			const result = parser.parse(["init"])
			expect(result.commands.has("init")).toBe(true)
		})

		it("should expose command action functions", () => {
			const parser = new Parser({
				options: [],
				commands: [new Cmd({ name: "test", fn: () => {} })],
			})

			const result = parser.parse(["test"])
			expect(result.actions.has("test")).toBe(true)
		})

		it("should expose parsed command data to the action function", () => {
			const parser = new Parser({
				options: [new Str({ name: "name" })],
				commands: [
					new Cmd({
						name: "init",
						fn: ({ options }) => {
							return options.get("name")
						},
					}),
				],
			})

			const parsedData = parser.parse(["init", "--name", "john"])

			expect(parsedData.actions.get("init")?.()).toBe("john")
		})
	})

	describe("command and option parsing", () => {
		it("should parse commands and options", () => {
			const parser = new Parser({
				options: [new Bool({ name: "verbose", alias: "v" })],
				commands: [new Cmd({ name: "init" })],
			})

			const result = parser.parse(["init", "--verbose"])
			expect(result.commands.has("init")).toBe(true)
			expect(result.options.get("verbose")).toBe(true)
		})

		it("should parse commands and options in any order", () => {
			const parser = new Parser({
				options: [new Bool({ name: "verbose", alias: "v" })],
				commands: [new Cmd({ name: "init" })],
			})

			const result = parser.parse(["--verbose", "init"])
			expect(result.commands.has("init")).toBe(true)
			expect(result.options.get("verbose")).toBe(true)
		})

		it("should parse multiple options", () => {
			const parser = new Parser({
				options: [new Bool({ name: "verbose", alias: "v" }), new Str({ name: "name", alias: "n" })],
				commands: [new Cmd({ name: "init" })],
			})

			const result = parser.parse(["init", "--verbose", "--name", "john"])
			expect(result.commands.has("init")).toBe(true)
			expect(result.options.get("verbose")).toBe(true)
			expect(result.options.get("name")).toBe("john")
		})

		it("should parse multiple options in any order", () => {
			const parser = new Parser({
				options: [new Bool({ name: "verbose", alias: "v" }), new Str({ name: "name", alias: "n" })],
				commands: [new Cmd({ name: "init" })],
			})

			const result = parser.parse(["--name", "john", "init", "--verbose"])
			expect(result.commands.has("init")).toBe(true)
			expect(result.options.get("verbose")).toBe(true)
			expect(result.options.get("name")).toBe("john")
		})

		it("should allow command-specific options after the command", () => {
			const parser = new Parser({
				options: [new Bool({ name: "verbose", alias: "v" })],
				commands: [new Cmd({ name: "init", options: [new Str({ name: "name", alias: "n" })] })],
			})

			const result = parser.parse(["--verbose", "init", "--name", "john"])
			expect(result.commands.has("init")).toBe(true)
			expect(result.options.get("verbose")).toBe(true)
			expect(result.options.get("name")).toBe("john")
		})

		it("should reject command-specific options before the command", () => {
			const parser = new Parser({
				options: [new Bool({ name: "verbose", alias: "v" })],
				commands: [new Cmd({ name: "init", options: [new Str({ name: "name", alias: "n" })] })],
			})

			expect(() => parser.parse(["--name", "john", "init", "--verbose"])).toThrow('Unknown command or option "--name"')
		})
	})

	describe("error handling", () => {
		it("should throw on unknown arguments", () => {
			const parser = new Parser({ options: [], commands: [] })

			expect(() => parser.parse(["unknown"])).toThrow("Unknown command or option")
		})

		it("should throw when required option is missing value", () => {
			const parser = new Parser({ options: [new Str({ name: "name", required: true })], commands: [] })

			expect(() => parser.parse(["--name"])).toThrow("requires a value")
		})

		it("should suggest similar commands when typo occurs", () => {
			const parser = new Parser({ options: [], commands: [new Cmd({ name: "init" })] })

			expect(() => parser.parse(["inyt"])).toThrow('Did you mean "init"')
		})
	})
})
