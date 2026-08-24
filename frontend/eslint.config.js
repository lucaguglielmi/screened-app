import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist', 'eslint.config.js'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/]",
          message: "Hex colors are forbidden. Use Tailwind v4 CSS variables/tokens (e.g., var(--color-surface)) instead."
        }
      ]
    },
  }
);
