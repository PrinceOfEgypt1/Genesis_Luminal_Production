/** @type {import('jest').Config} */
module.exports = {
  // Preset TypeScript
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Arquivos de teste
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.{js,ts}',
    '**/*.(test|spec).{js,ts}'
  ],
  
  // Transformações
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  
  // Module mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Coverage
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/**/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // TypeScript específico
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  
  // Timeout para testes
  testTimeout: 10000,
  
  // Verbose para debug
  verbose: true,
  
  // Setup files
  setupFilesAfterEnv: []
};
