import { CLIEntry } from "../types"

export const defaultMessages = {
  // Definition errors
  DEF_CMD_MISSING_NAME: () => "Command definition must include a 'name' property",
  DEF_FLAG_MISSING_NAME: () => "Flag definition must include a 'name' property",

  // Preset errors
  PRESET_NONE_PROVIDED: () => "At least one preset must be provided to the use() method",
  PRESET_MISSING_KIND: () =>
    "Invalid preset provided: missing 'kind' property. Preset must have a 'kind' property of 'command' or 'flag'",
  PRESET_MISSING_NAME: () => "Invalid preset provided: missing 'name' property. All presets must have a name",
  PRESET_INVALID_KIND: (kind: string) => `Invalid preset kind: "${kind}". Kind must be either "command" or "flag"`,

  // Token errors
  // @ts-expect-error nodes aren't used in the default error messages
  TOKEN_INVALID: (token: string, nodes?: CLIEntry[]) =>
    `Invalid token: "${token}". Check for typos or if this token is registered`,
  // @ts-expect-error nodes aren't used in the default error messages
  TOKEN_NOT_FOUND: (token: string, nodes?: CLIEntry[]) =>
    `Unable to resolve token "${token}". This token is not registered`,
  TOKEN_DUPLICATE: (entry: CLIEntry, token: string) =>
    `Token "${token}" is already used in "${entry?.name}". Each token must be unique`,
  TOKEN_BAD_FORMAT: (input: string) => `Invalid token format: "${input}". Tokens cannot be empty or include spaces`,

  // Context errors
  CTX_INVALID: () => "Invalid context. This operation is not allowed in the current context",
  CTX_INVALID_PARENT: (entry: CLIEntry, parent: CLIEntry) =>
    `${entry?.kind} "${entry?.name}" is not valid in this context. It can only be used with "${parent?.name}"`,
  // @ts-expect-error nodes aren't used in the default error messages
  CTX_WRONG_PARENT: (entry: CLIEntry, parent: CLIEntry) =>
    `${entry?.kind} "${entry?.name}" is not valid in this context. Check if the parent command is correctly defined`,

  // Argument errors
  // @ts-expect-error nodes aren't used in the default error messages
  ARG_INVALID: (flag: string, nodes?: CLIEntry[]) => `Invalid argument "${flag}". This argument is not recognized`,
  ARG_PARSING_ERROR: (entry: CLIEntry, error: unknown) => `Error parsing "${entry?.name}": ${error}`,
  ARG_MISSING_VALUE: (entry: CLIEntry) => `Missing value for "${entry?.name}". This flag requires a value`,
  ARG_INVALID_VALUE: (entry: CLIEntry, value: unknown) =>
    `Invalid value "${value}" for "${entry?.name}". Check the expected type and format`,
  ARG_INVALID_TYPE: (entry: CLIEntry, type: unknown) =>
    `Invalid type "${type}" for "${entry?.name}". Check the expected type in the documentation`,

  // Requirement errors
  REQ_FLAG_MISSING: (entry: CLIEntry, parent: CLIEntry) =>
    `${entry?.kind} "${entry?.name}" is required when using "${parent?.name}"`,

  // CLI execution errors
  CLI_INVALID_INPUT: () => "CLI input must be an array of strings",
  CLI_HELP_REPORTER_NOT_SET: () => "Help reporter is not set. See documentation for more information",
  CLI_HELP_DISPLAY_FAILED: (error: unknown) => `Failed to display help information: ${error}`,
  CLI_NO_ACTION_FOUND: (helpKind?: string, helpName?: string) => {
    const helpCommand = helpKind === "command" ? helpName || "help" : `--${helpName || "help"}`
    return `No command with an action was specified. Use ${helpCommand} to see available commands`
  },
  CLI_ACTION_FAILED: (error: unknown) => `Error executing command: ${error}`,
  CLI_INPUT_PROCESSING_FAILED: (error: unknown) => `Failed to process CLI input: ${error}`,
}

export type DefaultMessages = typeof defaultMessages
