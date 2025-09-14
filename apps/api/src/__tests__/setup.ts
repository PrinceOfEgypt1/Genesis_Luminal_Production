import { jest } from '@jest/globals';

// Mock do logger Winston
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock do Redis
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    get: jest.fn(),
    setEx: jest.fn(),
    disconnect: jest.fn()
  }))
}));

// Configuração de timeout para testes de integração
jest.setTimeout(10000);
