import { Command, Flag, ParsedArgs } from "./Parser"

/**
 * Manages a list of commands or flags, tracking required entries.
 * @typeParam T - The entry type, either Command or Flag.
 */
export class Scope<T extends Command | Flag = Command | Flag> {
  private readonly entries: T[] = []
  private readonly entriesMap: Map<string, T> = new Map()
  private readonly requiredEntriesIndex: number[] = []

  /**
   * Checks if the given key exists in the scope.
   * @param key - The key to look up.
   * @returns True if key is present, false otherwise.
   */
  has(key: string): boolean {
    return this.entriesMap.has(key)
  }

  /**
   * Retrieves an entry by its key.
   * @param key - The key of the entry to retrieve.
   * @returns The entry if found, or undefined.
   */
  get(key: string): T | undefined {
    return this.entriesMap.get(key)
  }

  /**
   * Adds a new entry to the scope and maps its associated keys.
   * @param entry - The command or flag to add.
   * @param keys - The set of key variations to map to this entry.
   */
  add(entry: T, keys: Set<string>): void {
    const index = this.entries.length
    this.entries.push(entry)

    for (const key of keys) {
      this.entriesMap.set(key, entry)
    }

    if (entry.required) this.requiredEntriesIndex.push(index)
  }

  /**
   * Verifies that all required entries exist in the parsed arguments.
   * @param args - A map of parsed flag values.
   * @throws An error if a required entry is missing.
   */
  checkRequiredEntries(args: Map<string, any>): void {
    for (const index of this.requiredEntriesIndex) {
      const entry = this.entries[index]
      if (!args.has(entry.name)) {
        throw new Error(
          `Missing required ${entry.type === "command" ? entry.type : `${entry.type} flag`}: ${entry.name}`,
        )
      }
    }
  }
}

/**
 * Provides scoped management for commands and flags, tracking an active command scope.
 */
export class IntelliScope {
  private readonly flagScopes: Scope<Flag>[] = []
  private readonly commandScopes: Scope<Command>[] = []
  private activeCommandScopeIndex = -1

  private getEntryKeys<T extends { name: string; alias?: string | string[]; prefix?: string; aliasPrefix?: string }>(
    entry: T,
  ): Set<string> {
    const keys = new Set([`${entry.prefix || ""}${entry.name}`])

    if (entry.alias) {
      const aliasList = Array.isArray(entry.alias) ? entry.alias : [entry.alias]
      for (const alias of aliasList) {
        keys.add(`${entry.aliasPrefix || ""}${alias}`)
      }
    }

    return keys
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
      scope.add(item, this.getEntryKeys(item))
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
