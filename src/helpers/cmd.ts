import { Command, CommandConfig } from "../Parser"

// === Command Factory Function ===
export function cmd(config: CommandConfig | Command) {
  // Create a new Command instance or return existing one
  if (config instanceof Command) return config
  return new Command(config)
}
