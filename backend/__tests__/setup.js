/**
 * @fileoverview Setup global para testes Jest
 * @description Configuração inicial executada antes de todos os testes
 */

// Mock de variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.TEST_DATABASE_URL = 'memory://test';

// Mock do logger para testes silenciosos
jest.mock('../src/logging/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Configuração global de timeouts
jest.setTimeout(10000);

// Suprimir warnings desnecessários em teste
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && args[0].includes('Warning: ReactDOM.render is deprecated')) {
    return;
  }
  originalWarn.apply(console, args);
};
