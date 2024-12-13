import { describe, it, expect, vi } from "vitest"
import { Cli } from "../src/cli"
import { Cmd } from "../src/commands"
import { Bool } from "../src/options"

describe("Cli", () => {
	it("should initialize with basic configuration", () => {
		const cli = new Cli({
			name: "test-cli",
			description: "Test CLI",
		})
		expect(cli).toBeDefined()
	})

	it("should execute commands correctly", () => {
		const mockFn = vi.fn()
		const cli = new Cli({
			name: "test-cli",
			description: "Test CLI",
			commands: [
				new Cmd({
					name: "test",
					description: "Test command",
					fn: mockFn,
				}),
			],
		})

		cli.run(["test"])
		expect(mockFn).toHaveBeenCalled()
	})

	it("should handle nested commands", () => {
		const parentMock = vi.fn()
		const childMock = vi.fn()
		const cli = new Cli({
			name: "test-cli",
			description: "Test CLI",
			commands: [
				new Cmd({
					name: "parent",
					description: "Parent command",
					fn: parentMock,
					commands: [
						new Cmd({
							name: "child",
							description: "Child command",
							fn: childMock,
						}),
					],
				}),
			],
		})

		cli.run(["parent", "child"])
		expect(childMock).toHaveBeenCalled()
	})

	it("should parse options correctly", () => {
		const mockFn = vi.fn()
		const cli = new Cli({
			name: "test-cli",
			description: "Test CLI",
			commands: [
				new Cmd({
					name: "test",
					description: "Test command",
					fn: mockFn,
				}),
			],
			options: [
				new Bool({
					name: "verbose",
					alias: "v",
					description: "Verbose output",
				}),
			],
		})

		const result = cli.run(["test", "--verbose"])
		expect(result.options.get("verbose")).toBe(true)
	})

	it("should handle errors in command execution", () => {
		const errorFn = vi.fn().mockImplementation(() => {
			throw new Error("Test error")
		})

		const cli = new Cli({
			name: "test-cli",
			description: "Test CLI",
			commands: [
				new Cmd({
					name: "error",
					description: "Error command",
					fn: errorFn,
				}),
			],
		})

		const result = cli.run(["error"])
		expect(result.error).toBeInstanceOf(Error)
	})
})
