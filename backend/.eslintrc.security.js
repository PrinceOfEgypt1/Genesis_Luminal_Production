/**
 * ESLint Security Configuration - Genesis Luminal Backend
 */

module.exports = {
  extends: [
    './.eslintrc.js', // Configuração base
    'plugin:security/recommended'
  ],
  plugins: [
    'security'
  ],
  rules: {
    // Security-specific rules
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-non-literal-require': 'error',
    'security/detect-object-injection': 'warn',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-unsafe-regex': 'error',
    
    // Additional security patterns
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    
    // Console statements (should not be in production)
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    
    // Debugging statements
    'no-debugger': 'error',
    'no-alert': 'error',
    
    // Type safety
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn'
  },
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.test.*'],
      rules: {
        // Relax some rules for tests
        'security/detect-non-literal-fs-filename': 'off',
        'no-console': 'off'
      }
    }
  ]
};
