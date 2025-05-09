import { CLIParser, CLIRegistry } from "../core"
import { CLI } from "../createCLI"
import { CLIErrorHandler } from "../errors"
import { CLIAction } from "../types"

/**
 * Parse input strings into tokens using CLIParser
 */
export async function parseInputToTokens(
  input: string[],
  registry: CLIRegistry,
  errorHandler: CLIErrorHandler,
): Promise<Set<number>> {
  const parser = new CLIParser(registry, errorHandler)
  const tokens = await parser.resolveTokens(input)
  return tokens.populateDefaults().enforceRequirements().current
}

/**
 * Process token indices into flags, actions, and help context
 */
export function processTokens<FlagTypes extends Record<string, unknown>>(
  indices: Set<number>,
  registry: CLIRegistry,
  help: { instance: CLI<FlagTypes> | null; def: { name: string } | undefined },
): {
  flags: Map<string & keyof FlagTypes, unknown>
  actions: CLIAction[]
  shouldShowHelp: boolean
  lastCommandIndex: number
} {
  const flags = new Map<string & keyof FlagTypes, unknown>()
  const actions: CLIAction[] = []
  let lastCommandIndex = 0
  let shouldShowHelp = false

  for (const index of indices) {
    const entry = registry.nodes[index]

    shouldShowHelp = checkForHelpRequest(entry, help, shouldShowHelp)
    collectFlag(entry, flags)
    lastCommandIndex = collectAction(entry, actions, lastCommandIndex)
  }

  return { flags, actions, shouldShowHelp, lastCommandIndex }
}

/**
 * Check if the current entry is a help request
 */
function checkForHelpRequest<FlagTypes extends Record<string, unknown>>(
  entry: any,
  help: { instance: CLI<FlagTypes> | null; def: { name: string } | undefined },
  currentValue: boolean,
): boolean {
  if (help.instance && entry.name === help.def?.name && entry.value === true) {
    return true
  }
  return currentValue
}

/**
 * Collect flag values from an entry
 */
function collectFlag<FlagTypes extends Record<string, unknown>>(
  entry: any,
  flags: Map<string & keyof FlagTypes, unknown>,
): void {
  if (entry.kind === "flag") {
    flags.set(entry.name as string & keyof FlagTypes, entry.value ?? entry.default)
  }
}

/**
 * Collect action handlers from an entry
 */
function collectAction(entry: any, actions: CLIAction[], lastCommandIndex: number): number {
  if (entry.kind === "command" && entry.action) {
    actions.push(entry.action)
    lastCommandIndex = entry.index
  }
  return lastCommandIndex
}
