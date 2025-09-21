/**
 * ESLint Security Configuration - Genesis Luminal Frontend
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
    // Security-specific rules for React
    'security/detect-object-injection': 'warn',
    'security/detect-unsafe-regex': 'error',
    'security/detect-eval-with-expression': 'error',
    
    // React-specific security
    'react/no-danger': 'error',
    'react/no-danger-with-children': 'error',
    'react/jsx-no-script-url': 'error',
    'react/jsx-no-target-blank': 'error',
    
    // General security
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    
    // Console and debugging
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': 'error',
    'no-alert': 'error',
    
    // Type safety
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn'
  },
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.test.*', '**/*.stories.*'],
      rules: {
        'no-console': 'off',
        'react/no-danger': 'off'
      }
    }
  ]
};
