import { defineConfig } from "vite"

export default defineConfig({
  root: ".",
  test: {
    watch: false,
    name: "cli",
    environment: "node",
    include: ["test/**.test.ts"],
    coverage: {
      exclude: ["build/**", "dist/**", "node_modules/**", "test/**", "*.config.ts", "*.config.js"],
      thresholds: {
        functions: 90,
        lines: 80,
        statements: 80,
        branches: 80,
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler", // or "modern"
      },
    },
  },
})
