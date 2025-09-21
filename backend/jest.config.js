/**
 * @fileoverview Configuração Jest para testes backend - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

module.exports = {
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Diretório raiz dos testes
  roots: ['<rootDir>/src'],
  
  // Padrões de arquivos de teste
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,ts}',
    '<rootDir>/src/**/*.(test|spec).{js,ts}'
  ],
  
  // Transformações TypeScript
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  
  // Extensões de arquivo suportadas
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Configuração de cobertura
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/node_modules/**',
    '!src/server.ts', // Arquivo de inicialização
  ],
  
  // Diretório de relatórios de cobertura
  coverageDirectory: 'coverage',
  
  // Formatos de relatório
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  
  // Thresholds de cobertura (Meta: 80%)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Setup de testes
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  // Mapeamento de módulos
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/src/__tests__/$1',
  },
  
  // Timeout para testes
  testTimeout: 10000,
  
  // Limpeza automática de mocks
  clearMocks: true,
  
  // Relatório verbose
  verbose: true,
};
