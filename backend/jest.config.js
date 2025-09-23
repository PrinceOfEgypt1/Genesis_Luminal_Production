/**
 * @fileoverview Configuração Jest Enterprise para Genesis Luminal Backend
 * @version 1.0.0
 * @author Genesis Luminal Team
 * @description Configuração otimizada para testes unitários, integração e coverage enterprise
 */

module.exports = {
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Diretórios de teste
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: [
    '**/__tests__/**/*.{js,ts}',
    '**/?(*.)+(spec|test).{js,ts}'
  ],
  
  // Transformações TypeScript
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'babel-jest'
  },
  
  // Extensões de arquivo
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  
  // Module name mapping para imports absolutos
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1'
  },
  
  // Coverage configuration (Meta: 60%+ para Sprint 6)
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  
  // Coverage thresholds (Quality Gate)
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  
  // Arquivos para coleta de coverage
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,js}',
    '!src/**/*.spec.{ts,js}',
    '!src/**/index.{ts,js}',
    '!src/**/__tests__/**'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  
  // Configurações de timeout
  testTimeout: 10000,
  
  // Verbose output para debugging
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Global teardown
  globalTeardown: '<rootDir>/__tests__/teardown.js'
};
