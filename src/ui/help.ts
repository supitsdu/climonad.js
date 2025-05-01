import { CLIRegistry } from "../core"
import { CLIEntry } from "../types"

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
