/**
 * NOTE: this file was added to workaround the issue mentioned:
 * here https://github.com/oven-sh/bun/issues/12366.
 * TODO: remove this file and it's installed plugins.
 */

import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections"

/** @type {import('@astrojs/starlight/expressive-code').StarlightExpressiveCodeOptions} */
export default {
  plugins: [
    // Call the plugin initialization function inside the plugins array
    pluginCollapsibleSections()
  ],
  themes: ["everforest-dark", "everforest-light"]
}
