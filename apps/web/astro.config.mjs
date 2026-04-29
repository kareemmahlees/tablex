import react from "@astrojs/react"
import starlight from "@astrojs/starlight"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    starlight({
      title: "Docs",
      logo: {
        replacesTitle: true,
        src: "./src/assets/logo-docs.svg"
      },
      favicon: "./src/assets/logo.svg",
      head: [
        // ICO favicon fallback for Safari.
        {
          tag: "link",
          attrs: {
            rel: "icon",
            href: "./src/assets/logo.svg",
            sizes: "32x32"
          }
        }
      ],
      customCss: ["./src/styles/docs.css"],
      social: [
        {
          icon: "github",
          label: "Github",
          href: "https://github.com/kareemmahlees/tablex"
        }
      ],
      editLink: {
        baseUrl: "https://github.com/kareemmahlees/tablex/edit/main/docs/"
      },
      sidebar: [
        { slug: "overview" },
        {
          label: "Features",
          items: [
            "features/settings",
            "features/keybindings",
            "features/cli",
            "features/updater",
            "features/api-docs"
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
        },
        { slug: "contributing" },
        { slug: "changelog" }
      ]
    })
  ],

  image: {
    domains: ["cdn.simpleicons.org"]
  },

  vite: {
    plugins: [tailwindcss()]
  }
})
