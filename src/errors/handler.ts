import { defaultMessages, DefaultMessages } from "./messages"

export type ErrorCodes = {
  [K in keyof DefaultMessages]: Parameters<DefaultMessages[K]>
}

export class CLIError<T extends Record<string, unknown[]>> extends Error {
  constructor(
    public code: keyof T,
    public args: T[keyof T],
    public message: string,
  ) {
    super(message)
    this.name = "CLIError"
  }
}

export class CLIErrorHandler<T extends Record<string, unknown[]> = ErrorCodes> {
  private messages: Partial<{
    [K in keyof T]: (...args: T[K]) => string
  }> = {}

  constructor(overrides: Partial<{ [K in keyof T]: (...args: T[K]) => string }> = {}) {
    this.messages = { ...defaultMessages, ...overrides }
  }

  create<K extends keyof T>(code: K, ...args: T[K]): CLIError<T> {
    const messageFn = this.messages[code]
    const message = messageFn?.(...args) ?? `Unknown error: ${String(code)}`

    return new CLIError<T>(code, args, message)
  }
}

export const errorHandler = new CLIErrorHandler<ErrorCodes>(defaultMessages)
