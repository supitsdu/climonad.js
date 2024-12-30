import type * as Types from "./types"

export namespace Parser {
  /**
   * Represents a node in the parsing tree.
   * @template T The type of value stored in the node.
   */
  export class Node<T> {
    children: Map<string, Node<T>>
    value: T | null

    constructor() {
      this.children = new Map()
      this.value = null
    }
  }

  /**
   * Represents a tree structure used for parsing commands and options.
   * @template T The type of values stored in the tree nodes.
   */
  export class Tree<T> {
    root: Node<T>
    cache: Map<string, T | null>

    constructor() {
      this.root = new Node<T>()
      this.cache = new Map()
    }

    /**
     * Inserts a path and associated value into the tree.
     * @param path The path string to insert.
     * @param value The value associated with the path.
     */
    insert(path: string, value: T) {
      if (!path) return
      const paths = [path, (value as any).alias].filter(Boolean) as string[]
      for (const p of paths) {
        const parts = p.split(" ")
        this._insertPath(parts, value)
      }
      this.clearCache()
    }

    /**
     * Clears the cache of search results.
     */
    clearCache() {
      this.cache.clear()
    }

    _insertPath(parts: string[], value: T) {
      if (!parts?.length) return
      let node = this.root
      if (!node) {
        node = this.root = new Node<T>()
      }
      for (const part of parts) {
        if (!node.children.has(part)) {
          node.children.set(part, new Node())
        }
        node = node.children.get(part)!
      }
      node.value = value
    }

    /**
     * Searches for a value associated with a given path.
     * @param path The path string to search for.
     * @returns The value associated with the path, or null if not found.
     */
    search(path: string): T | null {
      if (!this.root) {
        this.cache.set(path, null)
        return null
      }

      if (this.cache.has(path)) {
        return this.cache.get(path)!
      }

      let node = this.root
      const parts = path?.split(" ")

      for (const part of parts) {
        if (!node.children.has(part)) {
          this.cache.set(path, null)
          return null
        }
        node = node.children.get(part)!
      }

      const result = node.value
      this.cache.set(path, result)
      return result
    }

    has(path: string): boolean {
      return this.search(path) !== null
    }
  }

  export class Scope extends Tree<Types.Command | Types.Flag> {
    constructor(command: Types.Command | null) {
      super()
      if (command) {
        command.commands?.forEach((cmd) => {
          this.insert(cmd.name, cmd)
          if (cmd.alias) this.insert(cmd.alias, cmd)
        })
        command.flags?.forEach((opt) => {
          // renamed from command.options
          this.insert(opt.flag, opt)
          if (opt.alias) this.insert(opt.alias, opt)
        })
      }
    }
  }
}
