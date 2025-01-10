// === Parser Configuration Interfaces ===
export interface ParserConfig {
  next: string[]
  index: number
  hasFlag: (key: string) => boolean
  hasCmd: (key: string) => boolean
  setIndex: (index: number) => void
}

export type Parser<T = any> = (this: Flag<T>, config: ParserConfig) => T | null | Promise<T | null>

// === Flag Configuration Interfaces ===
export interface FlagConfig<T> {
  name: string
  description: string
  alias?: string
  required?: boolean
  default?: T
  parser?: Parser<T>
}

export interface FlagConstructorConfig<T> extends FlagConfig<T> {
  type: string
}

export const defaultParser: Parser = async function () {
  throw new Error("Missing implementation")
}

// === Flag Class Definition ===
export class Flag<T = any> {
  public readonly type: string
  public readonly name: string
  public readonly description: string
  public readonly required: boolean
  public readonly default?: T
  public readonly alias?: string
  public readonly parser: Parser<T>

  // Initialize flag properties
  constructor(config: FlagConstructorConfig<T>) {
    this.type = config.type
    this.name = config.name
    this.description = config.description
    this.required = config.required || false
    this.default = config.default
    this.alias = config.alias
    this.parser = config.parser || defaultParser
  }
}

// === Predefined Flag Constructors ===
export const bool = (config: FlagConfig<boolean>) =>
  new Flag<boolean>({ ...config, type: "boolean", parser: boolFlagParser })

export const str = (config: FlagConfig<string>) =>
  new Flag<string>({ ...config, type: "string", parser: strFlagParser })

export const num = (config: FlagConfig<number>) =>
  new Flag<number>({ ...config, type: "number", parser: numFlagParser })

// === Flag Parser Functions ===
export const boolFlagParser: Parser<boolean> = async function ({ next, index, setIndex }) {
  // Parse boolean flag values
  const value = next[index]

  if (value === "true" || value === "false") {
    setIndex(index + 1)
    return value === "true"
  }

  if (this.default !== undefined) return this.default

  return true
}

export const strFlagParser: Parser<string> = async function ({ next, hasFlag, hasCmd, index, setIndex }) {
  // Parse string flag values, ensuring it doesn't clash with existing flags or commands
  const value = next[index]

  if (hasFlag(value) || hasCmd(value)) {
    if (this.default !== undefined) return this.default
    return null
  }

  setIndex(index + 1)
  return value
}

export const numFlagParser: Parser<number> = async function ({ next, index, setIndex }) {
  // Parse numeric flag values
  const value = next[index]
  const num = Number(value)

  if (!isNaN(num)) {
    setIndex(index + 1)
    return num
  }

  if (this.default !== undefined) return this.default

  return null
}
