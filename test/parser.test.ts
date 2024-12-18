import { beforeEach, describe, expect, it } from "vitest"
import { Cli } from "../src/cli"
import { Parser } from "../src/parser"
import { Command, Flag } from "../src/types"

describe("Parser.Node", () => {
	it("should create an empty node", () => {
		const node = new Parser.Node<string>()
		expect(node.children.size).toBe(0)
		expect(node.value).toBeNull()
	})
})

describe("Parser.Tree", () => {
	let tree: Parser.Tree<string>

	beforeEach(() => {
		tree = new Parser.Tree<string>()
	})

	it("should insert and search simple paths", () => {
		tree.insert("test", "test-value")
		expect(tree.search("test")).toBe("test-value")
	})

	it("should handle compound paths", () => {
		tree.insert("cmd subcmd", "nested-value")
		expect(tree.search("cmd subcmd")).toBe("nested-value")
		expect(tree.search("cmd")).toBeNull()
	})

	it("should handle cache correctly", () => {
		tree.insert("cached", "cache-value")

		// First search should cache the result
		expect(tree.search("cached")).toBe("cache-value")
		expect(tree.cache.has("cached")).toBe(true)

		// Clear cache should remove the entry
		tree.clearCache()
		expect(tree.cache.has("cached")).toBe(false)
	})
})

describe("Parser.Scope", () => {
	it("should handle command and options registration", () => {
		const cmd = Cli.cmd({
			name: "test",
			description: "test command",
			options: [
				Cli.str({
					name: "input",
					flag: "--input",
					alias: "-i",
					description: "input file",
				}),
			],
			commands: [
				Cli.cmd({
					name: "subtest",
					description: "sub command",
				}),
			],
		})

		const scope = new Parser.Scope(cmd)

		expect(scope.search("subtest")).toBeInstanceOf(Command)
		expect(scope.search("--input")).toBeInstanceOf(Flag)
		expect(scope.search("-i")).toBeInstanceOf(Flag)
	})

	it("should handle null command", () => {
		const scope = new Parser.Scope(null)
		expect(scope.search("anything")).toBeNull()
	})

	it("should handle aliases correctly", () => {
		const cmd = Cli.cmd({
			name: "test",
			alias: "t",
			description: "test command",
		})

		const scope = new Parser.Scope(cmd)
		const result = scope.search("t")
		expect(result).toBeDefined()
	})
})

describe("Parser integration tests", () => {
	it("should work with CLI-like command structure", () => {
		const tree = new Parser.Tree<Command | Flag>()

		const rootCmd = Cli.cmd({
			name: "cli",
			description: "root command",
			commands: [
				Cli.cmd({
					name: "init",
					description: "initialize",
					options: [
						Cli.bool({
							name: "force",
							flag: "--force",
							description: "force initialization",
						}),
					],
				}),
			],
		})

		tree.insert(rootCmd.name, rootCmd)
		rootCmd.commands?.forEach(cmd => {
			tree.insert(cmd.name, cmd)
			cmd.options?.forEach(opt => {
				tree.insert(opt.flag, opt)
			})
		})

		expect(tree.search("cli")).toBeInstanceOf(Command)
		expect(tree.search("init")).toBeInstanceOf(Command)
		expect(tree.search("--force")).toBeInstanceOf(Flag)
	})
})
