import { Event } from "./Event"
import { CommandConfig, Parser } from "./Parser"

interface SetupOptions extends CommandConfig {
  name: string
  description: string
  startIndex?: number
}

export function cli(setupOptions: SetupOptions) {
  const options = {
    ...setupOptions,
    startIndex: setupOptions.startIndex || 2,
  }

  return {
    run: async (processArgv: string[]) => {
      const events = new Event()
      const parsedArgs = await Parser.parse(processArgv, options, events)
      if (parsedArgs) {
        events.emit("run")
      }
    },
  }
}
