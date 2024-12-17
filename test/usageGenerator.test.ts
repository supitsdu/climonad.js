import { describe, expect, it } from "vitest"
import { Flags } from "../src/flags"
import { Command } from "../src/types"
import { UsageGenerator } from "../src/usageGenerator"

describe("UsageGenerator", () => {
	// Test fixtures
	const helpFlag = new Flags.TypedFlag<boolean>(
		{
			type: "boolean",
			name: "help",
			flag: "--help",
			description: "Show help",
			alias: "-h",
		},
		() => true,
	)

	const verboseFlag = new Flags.TypedFlag<boolean>(
		{
			type: "boolean",
			name: "verbose",
			flag: "--verbose",
			description: "Verbose output",
			alias: "-v",
		},
		() => true,
	)

	const rootCommand = new Command({
		name: "cli",
		description: "Root command",
		commands: [
			new Command({
				name: "subcommand",
				description: "A subcommand",
				options: [verboseFlag],
			}),
		],
	})

	const globalOptions = [helpFlag]
	const generator = new UsageGenerator(rootCommand, globalOptions)

	describe("createHelpOption", () => {
		it("should create a help flag with correct properties", () => {
			const helpOption = UsageGenerator.createHelpOption()
			expect(helpOption.name).toBe("help")
			expect(helpOption.flag).toBe("--help")
			expect(helpOption.alias).toBe("-h")
			expect(helpOption.type).toBe("boolean")
		})
	})

	describe("generate", () => {
		it("should generate root help when no current command is provided", () => {
			const usage = generator.generate(null, [])
			expect(usage.name).toBe("cli")
			expect(usage.description).toBe("Root command")
			expect(usage.flags).toHaveLength(1)
			expect(usage.flags![0].name).toBe("--help, -h")
		})

		it("should generate command help for specific command", () => {
			const subcommand = rootCommand.commands![0]
			const usage = generator.generate(subcommand, ["cli", "subcommand"])

			expect(usage.name).toBe("cli subcommand")
			expect(usage.description).toBe("A subcommand")
			expect(usage.flags).toHaveLength(2) // verbose + help
			expect(usage.flags!.some(f => f.flag === "--verbose")).toBe(true)
			expect(usage.flags!.some(f => f.flag === "--help")).toBe(true)
		})
	})

	describe("generateRootHelp", () => {
		it("should generate help for root command with global options", () => {
			const usage = generator.generate(null, [])

			expect(usage.name).toBe("cli")
			expect(usage.description).toBe("Root command")
			expect(usage.flags).toHaveLength(1)
			expect(usage.flags![0].name).toBe("--help, -h")
		})
	})

	describe("generateCommandHelp", () => {
		it("should generate help for subcommand with combined options", () => {
			const subcommand = rootCommand.commands![0]
			const usage = generator.generate(subcommand, ["cli", "subcommand"])

			expect(usage.name).toBe("cli subcommand")
			expect(usage.description).toBe("A subcommand")
			expect(usage.flags).toHaveLength(2)
			expect(usage.flags!.map(f => f.flag)).toContain("--verbose")
			expect(usage.flags!.map(f => f.flag)).toContain("--help")
		})
	})
})
