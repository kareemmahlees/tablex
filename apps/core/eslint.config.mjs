import { fixupConfigRules } from "@eslint/compat"
import { FlatCompat } from "@eslint/eslintrc"
import js from "@eslint/js"
import tsParser from "@typescript-eslint/parser"
import reactRefresh from "eslint-plugin-react-refresh"
import globals from "globals"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [
  {
    ignores: ["**/dist", "src/components/ui", "src/bindings.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
    }
  },
  {
    ...fixupConfigRules(
      compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react-hooks/recommended"
      )
    ),
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
  },
  {
    plugins: {
      "react-refresh": reactRefresh
    },

    languageOptions: {
      globals: {
        ...globals.browser
      },

      parser: tsParser
    },

    rules: {
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true
        }
      ]
    }
  }
]
