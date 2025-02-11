import { Command, Flag, ParsedArgs } from "./Parser"

/**
 * Manages a scope of commands or flags using Registry Instance List (RIL) and
 * Tokenized Indexization Map (TIMap) for efficient lookup.
 * @typeParam T - The entry type, either Command or Flag.
 */
export class Scope<T extends Command | Flag = Command | Flag> {
  // Registry Instance List (RIL) - Stores actual instances
  private readonly registryInstanceList: T[] = []

  // Tokenized Indexization Map (TIMap) - Maps tokens to RIL indices
  private readonly tokenizedIndexMap: Map<string, number> = new Map()

  // Required Tokens List (RTL) - Stores indices of required instances
  private readonly requiredTokensList: number[] = []

  /**
   * Checks if the given token exists in the scope.
   */
  has(token: string): boolean {
    return this.tokenizedIndexMap.has(token)
  }

  /**
   * Retrieves an entry by its token.
   */
  get(token: string): T | undefined {
    const index = this.tokenizedIndexMap.get(token)
    return index !== undefined ? this.registryInstanceList[index] : undefined
  }

  /**
   * Adds a new entry to the scope and maps its associated tokens.
   */
  add(entry: T, tokens: Set<string>): void {
    const index = this.registryInstanceList.length
    this.registryInstanceList.push(entry)

    // Map all tokens to the same index in RIL
    for (const token of tokens) {
      this.tokenizedIndexMap.set(token, index)
    }

    // Add to RTL if required
    if (entry.required) {
      this.requiredTokensList.push(index)
    }
  }

  /**
   * Verifies that all required entries exist in the parsed arguments.
   */
  checkRequiredEntries(args: Map<string, any>): void {
    for (const index of this.requiredTokensList) {
      const entry = this.registryInstanceList[index]
      if (!args.has(entry.name)) {
        throw new Error(
          `Missing required ${entry.type === "command" ? entry.type : `${entry.type} flag`}: ${entry.name}`,
        )
      }
    }
  }
}

/**
 * Manages multiple scopes with enhanced token-based lookup.
 */
export class IntelliScope {
  private readonly flagScopes: Scope<Flag>[] = []
  private readonly commandScopes: Scope<Command>[] = []
  private activeCommandScopeIndex = -1

  private generateTokens<T extends { name: string; alias?: string | string[]; prefix?: string; aliasPrefix?: string }>(
    entry: T,
  ): Set<string> {
    const tokens = new Set([`${entry.prefix || ""}${entry.name}`])

    if (entry.alias) {
      const aliasList = Array.isArray(entry.alias) ? entry.alias : [entry.alias]
      for (const alias of aliasList) {
        tokens.add(`${entry.aliasPrefix || ""}${alias}`)
      }
    }

    return tokens
  }

  /**
   * Locates a command or flag in the most recent scope, updating the active scope.
   * @param key - The key to look up.
   * @returns The matching command or flag, or null if none found.
   */
  findEntry(key: string): Command | Flag | null {
    const latestCommandScope = this.commandScopes[this.commandScopes.length - 1]
    if (latestCommandScope?.has(key) && this.activeCommandScopeIndex !== this.commandScopes.length - 1) {
      this.activeCommandScopeIndex = this.commandScopes.length - 1
      return latestCommandScope.get(key) || null
    }

    for (const scope of this.flagScopes) {
      const entry = scope.get(key)
      if (entry) return entry
    }

    return null
  }

  /**
   * Creates a new scope from the given entries.
   * @param entries - The commands or flags to include in this scope.
   * @returns A Scope instance or null if no entries are provided.
   */
  createScope<T extends Command | Flag>(entries?: T[]): Scope<T> | null {
    if (!entries) return null

    const scope = new Scope<T>()
    for (const item of entries) {
      scope.add(item, this.generateTokens(item))
    }
    return scope
  }

  /**
   * Builds command and flag scopes from arrays of commands or flags.
   * @param commands - An optional array of command definitions.
   * @param flags - An optional array of flag definitions.
   */
  create(commands?: Command[], flags?: Flag[]): void {
    const commandScope = this.createScope(commands)
    const flagScope = this.createScope(flags)

    if (commandScope) this.commandScopes.push(commandScope)
    if (flagScope) this.flagScopes.push(flagScope)
  }

  /**
   * Checks for any missing requirements in the provided scopes.
   * @param parsedArgs - The parsed arguments to validate.
   * @param scopes - The relevant scopes to check for requirements.
   */
  hasMissingRequirements(parsedArgs: ParsedArgs, scopes: Scope[]): void {
    for (const scope of scopes) {
      scope.checkRequiredEntries(parsedArgs.flags)
    }
  }

  /**
   * Validates all required commands and flags across registered scopes.
   * @param parsedArgs - The parsed arguments to validate.
   */
  validateAll(parsedArgs: ParsedArgs): void {
    this.hasMissingRequirements(parsedArgs, this.flagScopes)
    this.hasMissingRequirements(parsedArgs, this.commandScopes)
  }
}
