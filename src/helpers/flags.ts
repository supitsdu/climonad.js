import { createFlag } from "../Parser"

/**
 * Creates a boolean flag, which defaults to true if no explicit value is provided.
 * @param config - The flag configuration object.
 * @returns A new boolean Flag instance.
 */
export const bool = createFlag<boolean>("boolean", async function (flag) {
  const value = this.next()

  if (value === "true" || value === "false") {
    this.incrementIndex()
    return value === "true"
  }

  if (flag.default !== undefined) return flag.default

  return true
})

/**
 * Creates a string flag, which captures the next token as a string.
 * @param config - The flag configuration object.
 * @returns A new string Flag instance.
 */
export const str = createFlag<string>("string", async function (flag) {
  const value = this.next()

  if (this.search(value) == null) {
    this.incrementIndex()
    return value
  }

  if (flag.default !== undefined) return flag.default

  return null
})

/**
 * Creates a numeric flag, parsing the next token as a number.
 * @param config - The flag configuration object.
 * @returns A new number Flag instance.
 */
export const num = createFlag<number>("number", async function (flag) {
  const value = this.next()
  const num = Number(value)

  if (!isNaN(num)) {
    this.incrementIndex()
    return num
  }

  if (flag.default !== undefined) return flag.default

  return null
})
