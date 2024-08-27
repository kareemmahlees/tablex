/**
 * NOTE: this file was added to workaround the issue mentioned:
 * here https://github.com/oven-sh/bun/issues/12366.
 * TODO: remove this file and it's installed plugins.
 */

import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections"
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers"

/** @type {import('@astrojs/starlight/expressive-code').StarlightExpressiveCodeOptions} */
export default {
  plugins: [
    // Call the plugin initialization function inside the plugins array
    pluginCollapsibleSections(),
    pluginLineNumbers()
  ],
  themes: ["material-theme-ocean", "material-theme-palenight"]
}
