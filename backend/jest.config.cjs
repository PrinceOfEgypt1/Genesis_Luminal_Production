module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  
  testMatch: [
    '<rootDir>/src/__tests__/**/*.test.ts'
  ],
  
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 10000,
  verbose: true
};
