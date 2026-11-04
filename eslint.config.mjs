import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    '**/node_modules/',
    '**/dist/',
    '**/build/',
    '**/.docusaurus/',
    '**/.vercel/',
    '.claude/',
    'project/package/ds-bundle/',
    'project/package/.ds-sync/',
    'project/package/.design-sync/.cache/',
    'project/package/.design-sync/learnings/',
    'docs-site/demos/',
    'docs-site/src/data/',
    'docs-site/static/',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['**/*.{js,mjs,cjs}', 'docs-site/docusaurus.config.ts', 'docs-site/sidebars.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['docs-site/scripts/verificar.mjs', 'project/package/scripts/medir-checkbox.mjs', 'project/package/scripts/verificar-table.mjs'],
    languageOptions: { globals: { ...globals.browser, React: 'readonly', ReactDOM: 'readonly' } },
  },
  prettier,
]);
