import { tablexTailwindPreset } from "@tablex/tailwind"
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["selector"],
  content: [
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  presets: [tablexTailwindPreset]
}

export default config
