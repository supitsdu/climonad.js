// @ts-nocheck

/**
 * Benchmarks for Climonad CLI Framework
 *
 * === Latest Benchmark Results (2024-12) ===
 * CPU: AMD Ryzen 7 4800HS with Radeon Graphics
 * Runtime: Deno 2.0.4 (x86_64-pc-windows-msvc)
 *
 *  benchmark                      time/iter (avg)        iter/s      (min … max)           p75      p99     p995
 * ------------------------------ ----------------------------- --------------------- --------------------------
 *  Cli.createCli                         725.4 ns     1,379,000 (670.4 ns …   1.2 µs) 722.6 ns   1.2 µs   1.2 µs
 *  Cli#parse (command only)              190.5 ns     5,249,000 (165.9 ns … 378.2 ns) 197.7 ns 291.2 ns 296.0 ns
 *  Cli#parse (option only)               570.2 ns     1,754,000 (230.4 ns …   1.3 µs) 721.1 ns   1.3 µs   1.3 µs
 *  Cli#parse (command + option)          654.5 ns     1,528,000 (323.9 ns …   1.3 µs) 809.4 ns   1.3 µs   1.3 µs
 *  Cli.createCli (with parse)              3.6 µs       281,000 (  3.0 µs …   4.1 µs)   3.6 µs   4.1 µs   4.1 µs
 *
 * Usage:
 * First, build the project with `npm run build` then run benchmarkds with `deno bench test/bench.ts`
 */
import { Cli } from "../dist/main.mjs"

// Setup test CLI instance with a sample command and options
// This instance will be reused across benchmarks
const helloCmd = Cli.cmd({
	name: "hello",
	description: "Say hello",
	options: [
		Cli.bool({
			name: "loud",
			flag: "--loud",
			alias: "-l",
			description: "Say hello loudly",
		}),
	],
})

const cli = Cli.createCli({
	name: "my-cli",
	version: "1.0.0",
	description: "My awesome CLI",
	commands: [helloCmd],
	options: [Cli.bool({ name: "verbose", flag: "--verbose", alias: "-v", description: "Enable verbose output" })],
})

/**
 * Benchmark Scenarios
 * ------------------
 */

// Scenario 1: Measure CLI creation performance
Deno.bench("Cli.createCli", () => {
	Cli.createCli({
		name: "benchmark-cli",
		version: "1.0.0",
		description: "Benchmark CLI",
		commands: [helloCmd],
	})
})

// Scenario 2: Measure parsing performance for different input combinations
Deno.bench("Cli#parse (command only)", () => {
	cli.parse(["hello"])
})

Deno.bench("Cli#parse (option only)", () => {
	cli.parse(["--verbose"])
})

Deno.bench("Cli#parse (command + option)", () => {
	cli.parse(["hello", "--loud", "--verbose"])
})

// Scenario 3: Measure parsing performance for a CLI instance with parse method
Deno.bench("Cli.createCli (with parse)", () => {
	const c = Cli.createCli({
		name: "benchmark-cli",
		version: "1.0.0",
		description: "Benchmark CLI",
		commands: [helloCmd],
	})

	c.parse(["hello"])
})
