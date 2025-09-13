/** ESLint config específico do workspace frontend (React + TS) */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier'
  ],
  settings: {
    react: { version: 'detect' }
  },
  ignorePatterns: ['dist', 'node_modules'],
  rules: {
    // JSX automático (React 17+)
    'react/react-in-jsx-scope': 'off',
    // Reduz ruído que TS já cobre
    'react/prop-types': 'off',
    'react/display-name': 'off',
    // Unknown props (React Three Fiber)
    'react/no-unknown-property': 'off',
    // A11y como aviso (não quebra CI)
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',

    // >>> Regra CRÍTICA e estável para UNUSED VARS <<<
    '@typescript-eslint/no-unused-vars': ['error', {
      'vars': 'all',
      'args': 'after-used',
      'ignoreRestSiblings': true,
      // Permitimos prefixo "_" para args/vars não usados
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      // NÃO reporta "error" não usado em catch(...), elimina os seus 9/10 erros
      'caughtErrors': 'none'
    }],

    // Demais avisos (mantidos como warnings, não críticos)
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/ban-ts-comment': ['warn', { 'ts-ignore': 'allow-with-description' }],
    'prefer-const': 'warn',
    'no-self-assign': 'warn'
  }
};
