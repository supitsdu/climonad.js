import { CLIDefinition, CLIEntry, CLIEntryDefinition } from "../types"

export class CLIRegistry {
  public nodes: CLIEntry[]
  public children: Record<number, Array<number>>
  public requires: Record<number, Array<number>>
  public withdefaults: Set<number>

  constructor() {
    this.nodes = []
    this.children = {}
    this.requires = {}
    this.withdefaults = new Set()
  }

  initialize(options: CLIDefinition) {
    // Initialize with the root node at index 0
    this.nodes[0] = {
      name: options?.name ?? "<root>",
      description: options?.description ?? "Root command",
      tokens: null,
      kind: "root",
      parentIndex: 0, // Set to 0 instead of null to satisfy CLIEntry type
      index: 0,
    }
  }

  register(def: CLIEntryDefinition): number {
    const index = this.nodes.length
    const parentIndex = def.parentIndex !== null ? def.parentIndex : 0 // Convert null to 0

    // Create entry with the guaranteed number parentIndex
    const entry: CLIEntry = { ...def, index, parentIndex }
    this.nodes.push(entry)

    this.addDependency(parentIndex, index)

    if (def.required) this.addRequirement(parentIndex, index)
    if (def.default !== undefined) this.withdefaults.add(index)

    return index
  }

  getEntry(position: number | string) {
    const idx = Number(position)
    const max = this.nodes.length
    if (idx > max || idx < 0) {
      return null
    }
    return this.nodes[idx]
  }

  addRequirement(parentIndex: number, childIndex: number) {
    if (!this.requires[parentIndex]) {
      this.requires[parentIndex] = []
    }
    this.requires[parentIndex].push(childIndex)
  }

  addDependency(parentIndex: number, childIndex: number) {
    if (!this.children[parentIndex]) {
      this.children[parentIndex] = []
    }
    this.children[parentIndex].push(childIndex)
  }

  set<K extends keyof CLIEntry>(index: number, key: K, value: CLIEntry[K]) {
    const entry = this.nodes[index]
    if (entry) {
      this.nodes[index] = { ...entry, [key]: value }
    }
  }
}
