// @ts-nocheck

/**
 * Benchmarks for Climonad CLI Framework
 *
 * === Latest Benchmark Results (2024-12) ===
 * CPU: AMD Ryzen 7 4800HS with Radeon Graphics
 * Runtime: Deno 2.0.4 (x86_64-pc-windows-msvc)
 *
 * benchmark                  time/iter (avg)        iter/s      (min … max)           p75      p99     p995
 * -------------------------- ----------------------------- --------------------- --------------------------
 * cli                               412.4 ns     2,425,000 (346.7 ns … 637.9 ns) 433.2 ns 548.4 ns 637.9 ns
 * parse (command only)              298.5 ns     3,350,000 (251.9 ns …   1.0 µs) 295.1 ns 867.2 ns   1.0 µs
 * parse (flag only)                   1.7 µs       604,000 (774.9 ns …   3.6 µs)   1.9 µs   3.6 µs   3.6 µs
 * parse (command + option)            1.8 µs       566,300 (600.0 ns …   8.0 ms) 900.0 ns   3.5 µs   4.7 µs
 * cli (with parse)                  857.0 ns     1,167,000 (400.0 ns …   3.5 ms) 700.0 ns   1.9 µs   2.4 µs
 *
 * Usage:
 * First, build the project with `npm run build` then run benchmarkds with `deno bench test/bench.ts`
 */
import { cmd, bool, cli } from "../dist/main.mjs"

// Setup test CLI instance with a sample command and options
// This instance will be reused across benchmarks
const helloCmd = cmd({
  name: "hello",
  description: "Say hello",
  flags: [
    bool({
      name: "loud",
      alias: "l",
      description: "Say hello loudly",
    }),
  ],
})

const app = cli({
  name: "my-cli",
  version: "1.0.0",
  description: "My awesome CLI",
  commands: [helloCmd],
  flags: [bool({ name: "verbose", alias: "v", description: "Enable verbose output" })],
})

/**
 * Benchmark Scenarios
 * ------------------
 */

// Scenario 1: Measure CLI creation performance
Deno.bench("cli", () => {
  cli({
    name: "benchmark-cli",
    version: "1.0.0",
    description: "Benchmark CLI",
    commands: [helloCmd],
  })
})

// Scenario 2: Measure parsing performance for different input combinations
Deno.bench("parse (command only)", () => {
  app.parse(["node", "script", "hello"])
})

Deno.bench("parse (flag only)", () => {
  app.parse(["node", "script", "--verbose"])
})

Deno.bench("parse (command + option)", () => {
  app.parse(["node", "script", "hello", "--loud", "--verbose"])
})

// Scenario 3: Measure parsing performance for a CLI instance with parse method
Deno.bench("cli (with parse)", () => {
  const a = cli({
    name: "benchmark-cli",
    version: "1.0.0",
    description: "Benchmark CLI",
    commands: [helloCmd],
  })

  a.parse(["node", "script", "hello"])
})
