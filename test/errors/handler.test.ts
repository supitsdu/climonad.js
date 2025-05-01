import { describe, expect, it, vi } from "vitest"
import { CLIError, CLIErrorHandler, defaultMessages, errorHandler, type ErrorArgsMap } from "../../src/errors"

describe("CLIErrorHandler", () => {
  // Test fixtures to reduce repetition
  const fixtures = {
    errorCodes: {
      validCode: "TOKEN_BAD_FORMAT" as const,
      invalidCode: "NONEXISTENT_CODE" as const,
    },
    args: {
      stringArg: "test-input",
      objectArg: { key: "value" },
      numberArg: 42,
    },
    messages: {
      custom: {
        CUSTOM_ERROR: () => "This is a custom error message",
        TOKEN_BAD_FORMAT: (input: string) => `Custom format error: ${input}`,
      },
    },
    expectedMessages: {
      tokenBadFormat: defaultMessages.TOKEN_BAD_FORMAT("test-input"),
      cmdMissingName: defaultMessages.DEF_CMD_MISSING_NAME(),
      presetInvalidKind: defaultMessages.PRESET_INVALID_KIND("invalid-kind"),
    },
  }

  describe("CLIError", () => {
    it("should extend Error class", () => {
      const error = new CLIError("TOKEN_BAD_FORMAT", ["test"], "Invalid token format: test")
      expect(error).toBeInstanceOf(Error)
    })

    it("should set properties correctly", () => {
      const code = fixtures.errorCodes.validCode
      const args = [fixtures.args.stringArg]
      const message = `Invalid token format: ${fixtures.args.stringArg}`

      const error = new CLIError(code, args, message)

      expect(error.code).toBe(code)
      expect(error.args).toEqual(args)
      expect(error.message).toBe(message)
      expect(error.name).toBe("CLIError")
    })
  })

  describe("constructor", () => {
    it("should initialize with default messages if no overrides provided", () => {
      const handler = new CLIErrorHandler()
      const error = handler.create("TOKEN_BAD_FORMAT", "test")

      expect(error.message).toBe(defaultMessages.TOKEN_BAD_FORMAT("test"))
    })

    it("should merge overrides with default messages", () => {
      const handler = new CLIErrorHandler(fixtures.messages.custom)

      // Test an overridden message
      const overriddenError = handler.create("TOKEN_BAD_FORMAT", "test")
      expect(overriddenError.message).toBe("Custom format error: test")

      // Test a new custom message
      const customError = handler.create("CUSTOM_ERROR" as any)
      expect(customError.message).toBe("This is a custom error message")
    })
  })

  describe("create", () => {
    it("should create a CLIError with the correct properties", () => {
      const handler = new CLIErrorHandler()
      const error = handler.create("TOKEN_BAD_FORMAT", "test")

      expect(error).toBeInstanceOf(CLIError)
      expect(error.code).toBe("TOKEN_BAD_FORMAT")
      expect(error.args).toEqual(["test"])
      expect(error.message).toBe(defaultMessages.TOKEN_BAD_FORMAT("test"))
    })

    it("should handle multiple arguments correctly", () => {
      const handler = new CLIErrorHandler()
      // Create a message function that takes multiple arguments for testing
      const multiArgFn = vi.fn().mockImplementation((a: string, b: number) => `Args: ${a}, ${b}`)

      // Temporarily add this function to the handler
      ;(handler as any).messages.MULTI_ARG_TEST = multiArgFn

      const error = handler.create("MULTI_ARG_TEST" as any, "test", 123)

      expect(error.args).toEqual(["test", 123])
      expect(multiArgFn).toHaveBeenCalledWith("test", 123)
    })

    it("should fallback to a generic message for unknown error codes", () => {
      const handler = new CLIErrorHandler()
      const error = handler.create(fixtures.errorCodes.invalidCode as any)

      expect(error.message).toBe(`Unknown error: ${fixtures.errorCodes.invalidCode}`)
    })

    it.each([
      {
        code: "TOKEN_BAD_FORMAT",
        args: ["bad-token"],
        expectedMessage: defaultMessages.TOKEN_BAD_FORMAT("bad-token"),
      },
      {
        code: "DEF_CMD_MISSING_NAME",
        args: [],
        expectedMessage: defaultMessages.DEF_CMD_MISSING_NAME(),
      },
      {
        code: "PRESET_INVALID_KIND",
        args: ["invalid-kind"],
        expectedMessage: defaultMessages.PRESET_INVALID_KIND("invalid-kind"),
      },
    ])("should create correct error for $code", ({ code, args, expectedMessage }) => {
      const handler = new CLIErrorHandler()
      const error = handler.create(code as any, ...args)

      expect(error.code).toBe(code)
      expect(error.args).toEqual(args)
      expect(error.message).toBe(expectedMessage)
    })
  })

  describe("exported errorHandler", () => {
    it("should be an instance of CLIErrorHandler", () => {
      expect(errorHandler).toBeInstanceOf(CLIErrorHandler)
    })

    it("should use default messages", () => {
      const error = errorHandler.create("TOKEN_BAD_FORMAT", "test")
      expect(error.message).toBe(defaultMessages.TOKEN_BAD_FORMAT("test"))
    })

    it("should be properly typed with ErrorArgsMap", () => {
      // This is a type check that ensures errorHandler is properly typed
      const isErrorHandler: CLIErrorHandler<ErrorArgsMap> = errorHandler
      expect(isErrorHandler).toBe(errorHandler)
    })
  })
})
