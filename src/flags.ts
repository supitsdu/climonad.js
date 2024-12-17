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
			if (this.multiple && Array.isArray(value)) {
				return value.every(v => (this.validator ? this.validator(v) : true))
			}
			return this.validator ? this.validator(value) : true
		}

		convert(value: unknown): T | T[] {
			if (this.multiple && Array.isArray(value)) {
				return value.map(v => this.converter(v))
			}
			return this.converter(value)
		}
	}
}
