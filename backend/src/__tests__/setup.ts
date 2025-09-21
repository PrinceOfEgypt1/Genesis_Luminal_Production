/**
 * @fileoverview Setup global para testes backend - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

// Configuração de timeout global
jest.setTimeout(10000);

// Mock de variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.ANTHROPIC_API_KEY = 'test-key';

// Mock global do logger para evitar ruído nos testes
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

// Substituir console em testes se necessário
global.console = {
  ...console,
  // Silenciar logs em testes (opcional)
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Setup para limpeza entre testes
beforeEach(() => {
  jest.clearAllMocks();
});

// Setup global para testes assíncronos
global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));
