export class CliError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "CliError"
  }

  static missingRequiredFlag(name: string) {
    return new CliError(`Missing required flag: ${name}`)
  }

  static missingRequiredCommand(name: string) {
    return new CliError(`Missing required command: ${name}`)
  }

  static missingRequiredArgument(name: string) {
    return new CliError(`Missing required argument: ${name}`)
  }

  static failedToParseFlag<T>(name: string, value: T) {
    return new CliError(`Failed to parse flag: ${name} - ${value}`)
  }

  static unknownCommandOrFlag(name: string) {
    return new CliError(`Unknown command or flag: ${name}`)
  }

  static missingImplementation() {
    return new CliError("Missing implementation")
  }
}
