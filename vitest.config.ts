import { defineConfig } from "vite"

export default defineConfig({
  root: ".",
  test: {
    watch: false,
    name: "cli",
    environment: "node",
    include: ["test/**.test.ts"],
  },
})
