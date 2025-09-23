/**
 * @fileoverview Setup global para testes Jest - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 * @description Configuração inicial, mocks e utilitários para todos os testes
 */

const { execSync } = require('child_process');

// Mock do logger Winston para testes
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock das métricas Prometheus para testes
jest.mock('../../src/utils/metrics', () => ({
  httpRequestsTotal: {
    inc: jest.fn(),
    labels: jest.fn().mockReturnThis()
  },
  httpRequestDuration: {
    observe: jest.fn(),
    labels: jest.fn().mockReturnThis()
  }
}));

// Setup global antes de todos os testes
beforeAll(async () => {
  // Configurar variáveis de ambiente para teste
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3001';
  process.env.ANTHROPIC_API_KEY = 'test-key-mock';
  
  console.log('🧪 Iniciando ambiente de testes Genesis Luminal');
});

// Cleanup após todos os testes
afterAll(async () => {
  console.log('🧹 Finalizando ambiente de testes');
});

// Utilitários de teste globais
global.testUtils = {
  // Gerar request mock
  createMockRequest: (overrides = {}) => ({
    method: 'GET',
    url: '/',
    headers: {},
    body: {},
    query: {},
    params: {},
    ...overrides
  }),
  
  // Gerar response mock
  createMockResponse: () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis()
    };
    return res;
  },
  
  // Gerar next mock
  createMockNext: () => jest.fn(),
  
  // Delay para testes assíncronos
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};
