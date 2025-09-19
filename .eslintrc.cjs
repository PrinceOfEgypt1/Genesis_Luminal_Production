module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    'prefer-const': 'error',
    'no-var': 'error',
    'no-undef': 'off' // Desabilitar no-undef para evitar falsos positivos
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  }
}
