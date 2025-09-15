/**
 * Configuração Jest Moderna - Genesis Luminal Backend
 * ✅ Sem warnings de configuração
 * ✅ Compatível com ts-jest v29+
 * ✅ Configuração moderna e limpa
 */

module.exports = {
  // Preset para TypeScript
  preset: 'ts-jest',
  
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Diretórios de origem
  roots: ['<rootDir>/src'],
  
  // Padrões de arquivo de teste
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.js'
  ],
  
  // Extensões suportadas
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // ✅ CONFIGURAÇÃO MODERNA ts-jest (sem warnings)
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      // Configuração inline moderna
      tsconfig: 'tsconfig.json',
      isolatedModules: false
    }]
  },
  
  // ✅ CORREÇÃO: moduleNameMapping → moduleNameMapper
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/index.ts'
  ],
  
  // Configurações de teste
  testTimeout: 10000,
  clearMocks: true,
  restoreMocks: true,
  
  // Setup
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  // Relatórios
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Performance
  maxWorkers: '50%',
  
  // Verbose apenas se necessário
  verbose: false
};
