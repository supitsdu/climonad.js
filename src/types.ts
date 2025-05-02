export interface CLITokenConstructor {
  match: (input: string) => boolean
  readonly tokens: Set<string>
}

export type ErrorMessage<T extends unknown[]> = string | ((...args: T) => string)

export interface CLIResult<T = unknown, E = unknown> {
  ok: boolean
  value: T | null
  error?: ErrorMessage<E[]>
}

export type CLIParser<T = unknown> = (input: string) => Promise<CLIResult<T>> | CLIResult<T>
export type CLIAction = (flags: Map<string, unknown>) => void | Promise<void>

export interface CLIDefinition<V = unknown> {
  name: string
  description: string
  version?: string
  aliases?: string[]
  required?: boolean
  action?: CLIAction
  default?: V
  prefixes?: {
    main?: string
    alias?: string
  }
  parser?: CLIParser<V> | null
}

export interface CLIEntryPreset<V = unknown> extends CLIDefinition<V> {
  kind: "flag" | "command"
  parser: CLIParser<V> | null
}

export interface CLIEntryDefinition<V = unknown> extends CLIDefinition<V> {
  kind: "command" | "flag" | "root"
  parentIndex: number | null
  tokens: CLITokenConstructor | null
  value?: V
}

export interface CLIEntry extends CLIEntryDefinition {
  index: number
  parentIndex: number
}
