import { defineConfig } from "vitest/config"

export default defineConfig({
  root: ".",
  test: {
    watch: false,
    name: "cli",
    environment: "node",
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      exclude: ["build/**", "dist/**", "node_modules/**", "test/**", "*.config.ts", "*.config.js"],
      reporter: ["text", "json", "html"],
      thresholds: {
        functions: 90,
        lines: 80,
        statements: 80,
        branches: 80,
      },
    },
  },
})
