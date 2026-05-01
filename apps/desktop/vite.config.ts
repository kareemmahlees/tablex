import { tanstackRouter } from "@tanstack/router-plugin/vite"
import { devtools } from "@tanstack/devtools-vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tanstackRouter(), react(), devtools(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
})
