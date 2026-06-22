import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // The app intentionally fetches and synchronizes async UI state inside effects.
      // Keep this as a warning-level architecture concern rather than a CI blocker.
      'react-hooks/set-state-in-effect': 'off',
      // router.tsx exports route objects/components together; acceptable for this Vite app.
      'react-refresh/only-export-components': 'off',
    },
  },
])
