module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  
  roots: ['<rootDir>/src'],
  testMatch: [
    'src/**/__tests__/**/*.test.ts',
    'src/**/*.test.ts'
  ],
  
  transform: {
    '^.+\.ts$': 'ts-jest'
  },
  
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testTimeout: 10000,
  verbose: true,
  clearMocks: true
};
