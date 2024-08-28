import pluginJs from "@eslint/js"
import react from "eslint-plugin-react"
import globals from "globals"
import tseslint from "typescript-eslint"

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    ...react.configs.flat.recommended,
    rules: {
      "react/react-in-jsx-scope": "off"
    },
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    }
  },
  {
    ignores: [
      "tailwind.config.ts",
      "src/components",
      "src/env.d.ts",
      ".astro",
      "node_modules"
    ]
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended
]
