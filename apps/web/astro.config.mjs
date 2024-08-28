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
      title: "Docs",
      logo: {
        replacesTitle: true,
        src: "./src/assets/logo-docs.svg"
      },
      customCss: ["./src/styles/docs.css"],
      social: {
        github: "https://github.com/kareemmahlees/tablex"
      },
      editLink: {
        baseUrl: "https://github.com/kareemmahlees/tablex/edit/main/docs/"
      },
      sidebar: [
        { label: "Overview", slug: "overview" },
        {
          label: "Features",
          items: [
            "features/settings",
            "features/keybindings",
            "features/cli",
            "features/updater"
          ]
        },
        {
          label: "References",
          items: [
            "references/settings",
            "references/keybindings",
            "references/cli"
          ],
          collapsed: true
        }
      ]
    })
  ]
})
