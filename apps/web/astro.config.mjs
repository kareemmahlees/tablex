import react from "@astrojs/react"
import starlight from "@astrojs/starlight"
import tailwind from "@astrojs/tailwind"
import { defineConfig } from "astro/config"

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false
    }),
    react(),
    starlight({
      title: "TableX Docs",
      logo: {
        src: "./public/logo.svg"
      },
      social: {
        github: "https://github.com/kareemmahlees/tablex"
      },
      editLink: {
        baseUrl: "https://github.com/kareemmahlees/tablex/edit/main/docs/"
      },
      sidebar: [
        { label: "Overview", slug: "overview" },
        { label: "Features", items: ["features/settings"] }
      ]
    })
  ]
})
