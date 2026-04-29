import { docsSchema } from "@astrojs/starlight/schema"
import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"

export const collections = {
  docs: defineCollection({
    schema: docsSchema(),
    loader: glob({ base: "./src/content/docs", pattern: "**/*.{md,mdx}" })
  })
}
