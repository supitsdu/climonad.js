import { CLIDefinition, CLIEntryPreset, CLIParser } from "../types"
import { CLINode } from "./node"

export function createPreset<T>(
  kind: "command" | "flag",
  config: CLIDefinition<T>,
  parser: CLIParser<T> | null,
): CLIEntryPreset<T> {
  return {
    kind,
    parser,
    ...config,
  }
}

export function cmd(config: CLIDefinition): CLIEntryPreset {
  return createPreset("command", config, null)
}

export function num(config: CLIDefinition<number>): CLIEntryPreset<number> {
  return createPreset("flag", config, (input) => {
    return Number.isFinite(+input) && input.trim() !== "" ? CLINode.Ok(Number(input)) : CLINode.Error(null)
  })
}

export function bool(config: CLIDefinition<boolean>): CLIEntryPreset<boolean> {
  return createPreset("flag", config, null)
}

export function str(config: CLIDefinition<string>): CLIEntryPreset<string> {
  return createPreset("flag", config, (input) => {
    return input?.length ? CLINode.Ok(input) : CLINode.Error(input)
  })
}
