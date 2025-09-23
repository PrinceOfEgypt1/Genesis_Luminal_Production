/**
 * @fileoverview Configuração Jest para Genesis Luminal - Padrão Enterprise
 * @version 1.0.0
 * @author Genesis Luminal Team
 * @description Configuração completa de testes com coverage, mocks e performance
 */

module.exports = {
  // Ambiente de execução
  testEnvironment: 'node',
  
  // Diretórios de teste
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.test.ts'
  ],
  
  // Cobertura obrigatória
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  
  // Thresholds de cobertura (Quality Gates)
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    },
    // Thresholds específicos para arquivos críticos
    './src/routes/*.js': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    './src/middleware/*.js': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Arquivos de cobertura
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/config/**',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  
  // Setup e teardown
  setupFilesAfterEnv: ['<rootDir>/tests/helpers/setup.js'],
  
  // Mapeamento de módulos (moduleNameMapper)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@fixtures/(.*)$': '<rootDir>/tests/fixtures/$1'
  },
  
  // Transformações
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  
  // Timeouts
  testTimeout: 10000,
  
  // Configurações de performance
  maxWorkers: '50%',
  cache: true,
  
  // Configurações de relatório
  verbose: true,
  bail: false,
  
  // Mock configurations
  clearMocks: true,
  restoreMocks: true,
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/'
  ]
};
