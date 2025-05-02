import { CLIErrorHandler } from "../errors"
import { CLIRegistry, CLITokens } from "../core"
import { CLIDefinition, CLIEntryPreset, CLIResult } from "../types"

export class CLINode {
  constructor(
    readonly registry: CLIRegistry,
    readonly parentIndex: number | null = null,
    readonly errorHandler: CLIErrorHandler,
  ) {}

  cmd(def: CLIDefinition) {
    if (!def || !def.name) {
      throw this.errorHandler.create("DEF_CMD_MISSING_NAME")
    }

    const { parentIndex, registry, errorHandler } = this
    const tokens = new CLITokens(def, errorHandler)

    return new CLINode(registry, registry.register({ ...def, kind: "command", parentIndex, tokens }), errorHandler)
  }

  flag(def: CLIDefinition) {
    if (!def || !def.name) {
      throw this.errorHandler.create("DEF_FLAG_MISSING_NAME")
    }

    const { parentIndex, registry, errorHandler } = this
    const tokens = new CLITokens({ ...CLINode.defaultFlagDefinition, ...def }, errorHandler)

    registry.register({ ...def, kind: "flag", parentIndex: parentIndex, tokens })
    return this
  }

  static defaultFlagDefinition: CLIDefinition = {
    name: "",
    description: "",
    prefixes: {
      alias: "-",
      main: "--",
    },
  }

  use(...presets: CLIEntryPreset[]) {
    if (!presets || presets.length === 0) {
      throw this.errorHandler.create("PRESET_NONE_PROVIDED")
    }

    for (const preset of presets) {
      if (!preset || !preset.kind) {
        throw this.errorHandler.create("PRESET_MISSING_KIND")
      }

      if (preset.kind === "flag") {
        this.flag(preset)
      } else if (preset.kind === "command") {
        this.cmd(preset)
      } else {
        throw this.errorHandler.create("PRESET_INVALID_KIND", preset.kind)
      }
    }
    return this
  }

  static Ok<V>(value: V): ParsingOK<V> {
    return new ParsingOK(value)
  }

  static Error<V>(value: V): ParsingNull<V> {
    return new ParsingNull(value)
  }
}

export class ParsingOK<V> implements CLIResult<V> {
  ok: boolean
  value: V | null
  constructor(value: V) {
    this.value = value
    this.ok = true
  }
}

export class ParsingNull<V> extends ParsingOK<V> {
  constructor(value: V) {
    super(value)
    this.ok = false
  }
}
