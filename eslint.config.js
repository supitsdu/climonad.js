import pluginJs from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import prettier from "eslint-config-prettier"

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Base configuration for all files
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // Apply recommended configs
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  // Ignores patterns
  {
    ignores: ["**docs/.vitepress/cache/**", "**/node_modules/**", "**/dist/**", "**/build/**", "**/coverage/**"],
  },

  // Source code specific rules
  {
    files: ["src/**/*.ts"],
    rules: {
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-console": "warn",
      "no-unused-expressions": "warn",
      // Additional TypeScript rules that match your coding patterns
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },

  // Test files specific rules
  {
    files: ["test/**/*.test.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest, // Add Jest globals for test files
      },
    },
    rules: {
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-console": "off", // Allow console in test files
      "@typescript-eslint/no-empty-function": "off", // Allow empty functions in tests
    },
  },

  // Benchmark tests specific rules
  {
    files: ["test/bench.ts"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "no-console": "off", // Allow console in benchmark tests
    },
  },

  // Apply prettier config at the end to ensure it overrides conflicting rules
  prettier,
]
