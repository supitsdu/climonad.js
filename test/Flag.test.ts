import { describe, expect, it } from "vitest"
import { bool, Flag, num, ParserConfig, str } from "../src/Flag"

describe("Flag", () => {
  describe("Constructor", () => {
    it("should create a flag with basic properties", () => {
      const flag = new Flag({
        type: "string",
        name: "test",
        description: "test flag",
        parser: async () => "test",
      })

      expect(flag.name).toBe("test")
      expect(flag.type).toBe("string")
      expect(flag.description).toBe("test flag")
      expect(flag.required).toBe(false)
      expect(flag.default).toBeUndefined()
      expect(flag.alias).toBeUndefined()
    })

    it("should create a flag with all properties", () => {
      const flag = new Flag({
        type: "number",
        name: "count",
        description: "count items",
        required: true,
        default: 42,
        alias: "c",
        parser: async () => 42,
      })

      expect(flag.name).toBe("count")
      expect(flag.type).toBe("number")
      expect(flag.required).toBe(true)
      expect(flag.default).toBe(42)
      expect(flag.alias).toBe("c")
    })

    it("should throw when parser is not implemented", async () => {
      const flag = new Flag({
        type: "string",
        name: "test",
        description: "test flag",
      })

      expect(() => flag.parser({} as ParserConfig)).toThrow()
    })
  })

  describe("Flag Constructors", () => {
    it("should create boolean flag", () => {
      const flag = bool({
        name: "verbose",
        description: "verbose mode",
      })

      expect(flag).toBeInstanceOf(Flag)
      expect(flag.type).toBe("boolean")
    })

    it("should create string flag", () => {
      const flag = str({
        name: "name",
        description: "user name",
      })

      expect(flag).toBeInstanceOf(Flag)
      expect(flag.type).toBe("string")
    })

    it("should create number flag", () => {
      const flag = num({
        name: "port",
        description: "port number",
      })

      expect(flag).toBeInstanceOf(Flag)
      expect(flag.type).toBe("number")
    })
  })

  describe("Flag Parsers", () => {
    describe("Boolean Parser", () => {
      it("should parse true/false strings", async () => {
        const flag = bool({ name: "test", description: "test" })
        const mockConfig = (value: string): ParserConfig => ({
          next: [value],
          index: 0,
          hasFlag: () => false,
          hasCmd: () => false,
          setIndex: () => {},
        })

        expect(await flag.parser(mockConfig("true"))).toBe(true)
        expect(await flag.parser(mockConfig("false"))).toBe(false)
      })

      it("should return default value when no value provided", async () => {
        const flag = bool({ name: "test", description: "test", default: false })
        const config: ParserConfig = {
          next: [],
          index: 0,
          hasFlag: () => false,
          hasCmd: () => false,
          setIndex: () => {},
        }

        expect(await flag.parser(config)).toBe(false)
      })

      it("should return true for flags without values", async () => {
        const flag = bool({ name: "test", description: "test" })
        const config: ParserConfig = {
          next: [],
          index: 0,
          hasFlag: () => false,
          hasCmd: () => false,
          setIndex: () => {},
        }

        expect(await flag.parser(config)).toBe(true)
      })
    })

    describe("String Parser", () => {
      it("should parse string values", async () => {
        const flag = str({ name: "test", description: "test" })
        const config: ParserConfig = {
          next: ["value"],
          index: 0,
          hasFlag: () => false,
          hasCmd: () => false,
          setIndex: () => {},
        }

        expect(await flag.parser(config)).toBe("value")
      })

      it("should return default when value is a flag", async () => {
        const flag = str({ name: "test", description: "test", default: "default" })
        const config: ParserConfig = {
          next: ["--flag"],
          index: 0,
          hasFlag: (key) => key === "--flag",
          hasCmd: () => false,
          setIndex: () => {},
        }

        expect(await flag.parser(config)).toBe("default")
      })

      it("should return null when invalid and no default", async () => {
        const flag = str({ name: "test", description: "test" })
        const config: ParserConfig = {
          next: ["--flag"],
          index: 0,
          hasFlag: (key) => key === "--flag",
          hasCmd: () => false,
          setIndex: () => {},
        }

        expect(await flag.parser(config)).toBeNull()
      })
    })

    describe("Number Parser", () => {
      it("should parse valid numbers", async () => {
        const flag = num({ name: "test", description: "test" })
        const config: ParserConfig = {
          next: ["42"],
          index: 0,
          hasFlag: () => false,
          hasCmd: () => false,
          setIndex: () => {},
        }

        expect(await flag.parser(config)).toBe(42)
      })

      it("should parse negative numbers and decimals", async () => {
        const flag = num({ name: "test", description: "test" })
        const mockConfig = (value: string): ParserConfig => ({
          next: [value],
          index: 0,
          hasFlag: () => false,
          hasCmd: () => false,
          setIndex: () => {},
        })

        expect(await flag.parser(mockConfig("-42"))).toBe(-42)
        expect(await flag.parser(mockConfig("3.14"))).toBe(3.14)
      })

      it("should return default for invalid numbers", async () => {
        const flag = num({ name: "test", description: "test", default: 100 })
        const config: ParserConfig = {
          next: ["invalid"],
          index: 0,
          hasFlag: () => false,
          hasCmd: () => false,
          setIndex: () => {},
        }

        expect(await flag.parser(config)).toBe(100)
      })

      it("should return null for invalid numbers without default", async () => {
        const flag = num({ name: "test", description: "test" })
        const config: ParserConfig = {
          next: ["invalid"],
          index: 0,
          hasFlag: () => false,
          hasCmd: () => false,
          setIndex: () => {},
        }

        expect(await flag.parser(config)).toBeNull()
      })
    })
  })
})
