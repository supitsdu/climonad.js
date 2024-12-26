import { defineConfig } from "vite"

export default defineConfig({
  root: ".",
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler", // or "modern"
      },
    },
  },
})
