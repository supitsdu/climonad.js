import { CLIRegistry } from "../core"
import type { CLIDefinition, CLIEntry } from "../types"

export class CLIHelpConstructor {
  parent: CLIEntry | null
  root: CLIEntry
  commands: CLIEntry[]
  flags: CLIEntry[]

  constructor(reg: CLIRegistry, lastCommand: number) {
    const root = reg.nodes[lastCommand]
    this.root = root
    this.parent = root.parentIndex !== null ? reg.nodes[root.parentIndex] : null
    this.commands = (reg.children[root.index] || [])
      .map((index) => reg.nodes[index])
      .filter((entry) => entry.kind === "command")
    this.flags = (reg.children[root.index] || [])
      .map((index) => reg.nodes[index])
      .filter((entry) => entry.kind === "flag")
  }
}

export type HelpReporter = (ctx: CLIHelpConstructor) => void | Promise<void>

export class CLIHelp {
  constructor(
    readonly reporter: HelpReporter,
    readonly def: CLIDefinition,
    readonly kind: "command" | "flag" = "flag",
  ) {}
}

export const createCLIHelp = (
  reporter: HelpReporter,
  { kind, aliases, ...options }: Partial<CLIDefinition & { kind: "command" | "flag" }> = {},
): CLIHelp => {
  return new CLIHelp(
    reporter,
    {
      name: options.name || "help",
      description: options.description || "Display help information",
      aliases: aliases || ["h"],
    },
    kind,
  )
}
