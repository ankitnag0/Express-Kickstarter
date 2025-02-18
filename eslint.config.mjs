import pluginJs from '@eslint/js';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { files: ['**/*.{js,mjs,cjs,ts,tsx}'] },
  {
    languageOptions: {
      globals: globals.node,
      parser: '@typescript-eslint/parser',
    },
  },
  { ignores: ['dist/**'] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': 'warn',
      'simple-import-sort/imports': 'warn', // sorts your imports
      'simple-import-sort/exports': 'warn', // sorts your exports
      // Optionally disable import/order if it conflicts:
      'import/order': 'off',
    },
  },
  // Override rules for .d.ts files
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
