import { describe, expect, it } from "vitest"
import { Cli, CliError } from "../src/cli"

describe("Cli.Setup", () => {
  it("should create a CLI with basic configuration", () => {
    const cli = Cli.createCli({
      name: "test-cli",
      description: "Test CLI",
    })
    expect(cli).toBeInstanceOf(Cli.Setup)
  })

  describe("Command Parsing", () => {
    const cli = Cli.createCli({
      name: "test-cli",
      description: "Test CLI",
      commands: [
        Cli.cmd({
          name: "serve",
          description: "Start server",
          alias: "s",
        }),
        Cli.cmd({
          name: "build",
          description: "Build project",
        }),
      ],
    })

    it("should parse simple command", () => {
      const result = cli.parse(["serve"])
      expect(result.commands.has("serve")).toBe(true)
    })

    it("should parse command alias", () => {
      const result = cli.parse(["s"])
      expect(result.commands.has("s")).toBe(true)
    })
  })

  describe("Flag Parsing", () => {
    const cli = Cli.createCli({
      name: "test-cli",
      description: "Test CLI",
      flags: [
        Cli.str({ name: "host", flag: "--host", description: "Host name" }),
        Cli.num({ name: "port", flag: "--port", description: "Port number" }),
        Cli.bool({ name: "verbose", flag: "--verbose", description: "Verbose mode" }),
      ],
    })

    it("should parse string flag correctly", () => {
      const result = cli.parse(["--host", "localhost"])
      expect(result.flags.get("host")).toBe("localhost")
    })

    it("should parse number flag correctly", () => {
      const result = cli.parse(["--port", "3000"])
      expect(result.flags.get("port")).toBe(3000)
    })

    it("should parse boolean flag correctly", () => {
      const result = cli.parse(["--verbose"])
      expect(result.flags.get("verbose")).toBe(true)
    })
  })

  describe("Error Handling", () => {
    const cli = Cli.createCli({
      name: "test-cli",
      description: "Test CLI",
      flags: [Cli.num({ name: "port", flag: "--port", description: "Port number" })],
    })

    it("should throw an error on unknown argument", () => {
      expect(() => cli.parse(["--unknown"])).toThrow(CliError)
    })

    it("should throw an error on invalid number value", () => {
      expect(() => cli.parse(["--port", "invalid"])).toThrow(CliError)
    })
  })

  describe("Help Generation", () => {
    const cli = Cli.createCli({
      name: "test-cli",
      description: "Test CLI",
      commands: [
        Cli.cmd({
          name: "serve",
          description: "Start server",
        }),
      ],
    })

    it("should generate help when --help is used", () => {
      const result = cli.parse(["--help"])
      const help = result.generateHelp()
      expect(help).toBeTruthy()
      expect(help?.name).toBe("test-cli")
    })

    it("should generate command-specific help", () => {
      const result = cli.parse(["serve", "--help"])
      const help = result.generateHelp()
      expect(help).toBeTruthy()
      expect(help?.name).toBe("serve")
    })
  })

  describe("Default Values", () => {
    const cli = Cli.createCli({
      name: "test-cli",
      description: "Test CLI",
      flags: [
        Cli.str({
          name: "env",
          flag: "--env",
          description: "Environment",
          default: "development",
        }),
      ],
    })

    it("should use default value when flag is not provided", () => {
      const result = cli.parse([])
      expect(result.flags.get("env")).toBe("development")
    })
  })

  describe("Required Flags", () => {
    const cli = Cli.createCli({
      name: "test-cli",
      description: "Test CLI",
      flags: [
        Cli.str({
          name: "config",
          flag: "--config",
          description: "Configuration file",
          required: true,
        }),
      ],
    })

    it("should parse required flag when provided", () => {
      const result = cli.parse(["--config", "app.config"])
      expect(result.flags.get("config")).toBe("app.config")
    })

    it("should throw an error when required flag is missing", () => {
      expect(() => cli.parse([])).toThrow(CliError)
    })
  })

  describe("Required Flags with Default Values", () => {
    const cli = Cli.createCli({
      name: "test-cli",
      description: "Test CLI",
      flags: [
        Cli.str({
          name: "config",
          flag: "--config",
          description: "Configuration file",
          required: true,
          default: "default.config",
        }),
      ],
    })

    it("should use default value when required flag is not provided", () => {
      const result = cli.parse([])
      expect(result.flags.get("config")).toBe("default.config")
    })

    it("should use provided value over default for required flag", () => {
      const result = cli.parse(["--config", "user.config"])
      expect(result.flags.get("config")).toBe("user.config")
    })
  })
})
