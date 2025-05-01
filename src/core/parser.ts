import { CLIError, CLIErrorHandler } from "../errors"
import { CLIRegistry } from "./registry"
import { CLIEntry } from "../types"

export class CLIParser {
  readonly registry: CLIRegistry
  readonly expected: Set<number>
  readonly excluded: Set<number>
  readonly current: Set<number>
  readonly valueMap: Record<number, number>
  readonly errorHandler: CLIErrorHandler

  constructor(registry: CLIRegistry, errorHandler: CLIErrorHandler) {
    this.registry = registry
    this.expected = new Set<number>(this.registry.children[0]!)
    this.excluded = new Set<number>()
    this.current = new Set<number>()
    this.valueMap = {}
    this.errorHandler = errorHandler
  }

  populateDefaults() {
    for (const idx of this.expected) {
      if (!this.current.has(idx) && this.registry.withdefaults.has(idx)) {
        this.current.add(idx)
      }
    }
    return this
  }

  enforceRequirements() {
    for (const [idx, deps] of Object.entries(this.registry.requires)) {
      if (!this.current.has(Number(idx))) continue

      for (const dep of deps) {
        if (!this.current.has(dep)) {
          const entry = this.registry.nodes[dep]
          throw this.errorHandler.create("REQ_FLAG_MISSING", entry, this.registry.nodes[Number(idx)])
        }
      }
    }
    return this
  }

  async resolveTokens(input: string[]) {
    for (let i = 0; i < input.length; i++) {
      if (this.valueMap[i]) continue

      const token = input[i]
      const entry = this.findEntry(token)

      this.validateEntry(entry, token)

      this.updateState(entry)

      if (entry.kind === "flag") {
        i = await this.handleFlag(entry, input, i)
      }
    }

    return this
  }

  findEntry(token: string): CLIEntry {
    const entry = this.registry.nodes.find((e) => e.tokens?.match(token))
    if (!entry) {
      throw this.errorHandler.create("TOKEN_NOT_FOUND", token, this.registry.nodes)
    }
    return entry
  }

  validateEntry(entry: CLIEntry, token: string) {
    if (this.current.has(entry.index)) {
      throw this.errorHandler.create("TOKEN_DUPLICATE", entry, token)
    }

    const isCmd = entry.kind === "command"
    const invalid = !this.expected.has(entry.index) || (isCmd && this.excluded.has(entry.parentIndex))

    if (invalid) {
      const parent = this.registry.getEntry(entry.parentIndex)
      if (parent) {
        throw this.errorHandler.create("CTX_INVALID_PARENT", entry, parent)
      }

      throw this.errorHandler.create("CTX_INVALID")
    }
  }

  updateState(entry: CLIEntry) {
    const isCmd = entry.kind === "command"
    this.current.add(entry.index)
    this.expected.delete(entry.index)

    if (isCmd) {
      for (const child of this.registry.children[entry.index] || []) {
        this.expected.add(child)
      }
      this.excluded.add(entry.parentIndex)
    }
  }

  async handleFlag(entry: CLIEntry, input: string[], i: number) {
    if (entry.parser == null) {
      this.registry.set(entry.index, "value", true)
      this.valueMap[i] = entry.index
      return i
    }

    try {
      const next = i + 1
      if (next >= input.length) {
        throw this.errorHandler.create("ARG_MISSING_VALUE", entry)
      }

      const result = await entry.parser(input[next])

      if (!result.ok) {
        throw this.errorHandler.create("ARG_INVALID_VALUE", entry, result.error)
      }

      this.registry.set(entry.index, "value", result.value)
      this.valueMap[next] = entry.index
      return next
    } catch (error) {
      if (error instanceof CLIError) {
        throw error
      }
      throw this.errorHandler.create("ARG_PARSING_ERROR", entry, error)
    }
  }
}
