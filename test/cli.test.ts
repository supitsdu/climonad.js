import { beforeEach, describe, expect, it, vi } from "vitest"
import { Bool, Cli, Cmd } from "../src/main"

describe("Cli", () => {
	const mockAction = vi.fn()
	const cli = new Cli({
		name: "my-cli",
		description: "My awesome CLI",
		commands: [
			new Cmd({
				name: "hello",
				alias: "h",
				description: "Say hello",
				fn: mockAction,
			}),
		],
		options: [
			new Bool({
				name: "loud",
				alias: "l",
				defaultValue: true,
				description: "Say hello loudly",
			}),
		],
	})

	beforeEach(() => {
		mockAction.mockClear()
	})

	it("should execute command with full name", () => {
		const result = cli.run(["hello"])
		expect(mockAction).toHaveBeenCalledTimes(1)
		expect(result.commands?.get("hello")).toBeTruthy()
	})

	it("should execute command with alias", () => {
		const result = cli.run(["h"])
		expect(mockAction).toHaveBeenCalledTimes(1)
		expect(result.commands?.get("hello")).toBeTruthy()
	})

	it("should parse boolean option with full name", () => {
		const result = cli.run(["hello", "--loud"])
		expect(result.options.get("loud")).toBe(true)
		expect(mockAction).toHaveBeenCalledTimes(1)
	})

	it("should parse boolean option with alias", () => {
		const result = cli.run(["hello", "-l"])
		expect(result.options.get("loud")).toBe(true)
		expect(mockAction).toHaveBeenCalledTimes(1)
	})

	it("should handle invalid command", () => {
		const result = cli.run(["invalid"])
		expect(result.error).toBeDefined()
		expect(mockAction).not.toHaveBeenCalled()
	})

	it("should handle invalid option", () => {
		const result = cli.run(["hello", "--invalid"])
		expect(result.error).toBeDefined()
		expect(mockAction).not.toHaveBeenCalled()
	})
})
