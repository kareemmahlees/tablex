import { tablexTailwindPreset } from "@tablex/tailwind"
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  presets: [tablexTailwindPreset]
}

export default config
