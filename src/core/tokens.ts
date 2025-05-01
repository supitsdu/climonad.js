import { CLIErrorHandler } from "../errors"
import type { CLIDefinition, CLITokenConstructor } from "../types"

interface TokensOptions extends Partial<CLIDefinition> {
  name: string
}

export const isString = (value: unknown): boolean => typeof value === "string" && value.trim() !== ""

const hasSpaces = (value: string): boolean => value.includes(" ")

export class CLITokens implements CLITokenConstructor {
  public readonly tokens: Set<string>

  constructor(options: TokensOptions, errorHandler: CLIErrorHandler) {
    const { name, prefixes = {}, aliases = [] } = options

    const mainPrefix = prefixes.main || ""
    const aliasPrefix = prefixes.alias || ""

    this.tokens = new Set([CLITokens.join(mainPrefix, name, errorHandler)])

    if (aliases && aliases.length > 0) {
      aliases.forEach((alias) => {
        this.tokens.add(CLITokens.join(aliasPrefix, alias, errorHandler))
      })
    }
  }

  static join(prefix: string = "", input: string, errorHandler: CLIErrorHandler): string {
    if (!isString(input) || hasSpaces(input)) {
      throw errorHandler.create("TOKEN_BAD_FORMAT", input)
    }
    return `${prefix}${input}`
  }

  public match(input: string): boolean {
    return this.tokens.has(input)
  }
}
