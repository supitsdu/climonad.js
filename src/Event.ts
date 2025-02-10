export class Event {
  private listeners: Map<string, Array<(...args: any[]) => void | Promise<void>>> = new Map()

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: (...args: any[]) => void): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      this.listeners.set(
        event,
        handlers.filter((fn) => fn !== callback),
      )
    }
  }

  async emit(event: string, ...args: any[]): Promise<void> {
    const handlers = this.listeners.get(event)
    if (handlers) {
      for (const handler of handlers) {
        await handler(...args)
      }
    }
  }

  async emitLast(event: string, ...args: any[]): Promise<void> {
    const handler = this.listeners.get(event)?.[this.listeners.get(event)!.length - 1]
    if (handler) {
      await handler(...args)
    }
  }
}
