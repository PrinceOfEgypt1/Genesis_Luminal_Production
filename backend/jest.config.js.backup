module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.{js,ts}',
    '**/?(*.)+(spec|test).{js,ts}'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // ✅ COVERAGE THRESHOLDS PARA INTEGRATION TESTS
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20
    }
  },
  
  // ✅ SETUP FILES PARA MOCKS
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/src/$1'
  },
  
  // ✅ CONFIGURAÇÃO ESPECÍFICA PARA TYPESCRIPT
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  
  // ✅ IGNORAR NODE_MODULES EXCETO ALGUNS PACOTES
  transformIgnorePatterns: [
    'node_modules/(?!(supertest|@jest/.*)/)'
  ],
  
  // ✅ TIMEOUT PARA TESTES DE INTEGRAÇÃO
  testTimeout: 30000,
  
  // ✅ CONFIGURAÇÃO PARA DIFERENTES TIPOS DE TESTE
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/src/__tests__/basic*.{js,ts}'],
      testEnvironment: 'node'
    },
    {
      displayName: 'integration', 
      testMatch: ['<rootDir>/src/__tests__/integration/**/*.{js,ts}'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts']
    }
  ]
}
