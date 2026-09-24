/**
 * Minimal ESLint surface for typography discipline (PRO-279).
 * Not a full React/TS lint suite — only the local no-arbitrary-text-size rule.
 *
 * Stub `react-hooks/exhaustive-deps` so existing eslint-disable comments
 * (written when the project had no ESLint config) do not fail the run.
 */
import tseslint from 'typescript-eslint';
import noArbitraryTextSize from './eslint-rules/no-arbitrary-text-size.js';

const noopRule = {
  meta: { schema: [] },
  create() {
    return {};
  },
};

export default tseslint.config(
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    plugins: {
      local: {
        rules: {
          'no-arbitrary-text-size': noArbitraryTextSize,
        },
      },
      'react-hooks': {
        rules: {
          'exhaustive-deps': noopRule,
        },
      },
    },
    rules: {
      'local/no-arbitrary-text-size': 'error',
    },
  },
);
