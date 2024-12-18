import * as Types from "./types"

export namespace Flags {
	export class TypedFlag<T> extends Types.Flag {
		constructor(
			config: Types.FlagConfig,
			private readonly converter: (value: unknown) => T,
			private readonly validator?: (value: unknown) => boolean,
		) {
			super(config)
		}

		isValid(value: unknown): boolean {
			return this.validator ? this.validator(value) : true
		}

		convert(value: unknown): T | T[] {
			return this.converter(value)
		}
	}
}
