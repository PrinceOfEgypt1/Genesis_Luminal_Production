/**
 * Configuração Jest para Genesis Luminal Backend
 * Suporte completo para TypeScript com ts-jest
 */

module.exports = {
  // Preset para TypeScript
  preset: 'ts-jest',
  
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Diretórios de origem dos testes
  roots: ['<rootDir>/src'],
  
  // Padrões de arquivo de teste
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).ts',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Extensões de arquivo para resolver
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Transformações de arquivo
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.tsx$': 'ts-jest',
  },
  
  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/index.ts', // Excluir arquivo principal que só inicia servidor
  ],
  
  // Diretório de saída da cobertura
  coverageDirectory: 'coverage',
  
  // Relatórios de cobertura
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // Setup após ambiente
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  // Timeout para testes
  testTimeout: 10000,
  
  // Ignorar transformações para node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  
  // Configuração do ts-jest
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true
    }
  },
  
  // Módulos mock
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Limpar mocks automaticamente
  clearMocks: true,
  
  // Restaurar mocks automaticamente
  restoreMocks: true,
  
  // Verbose output
  verbose: true
};
