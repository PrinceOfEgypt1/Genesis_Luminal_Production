// Mock do logger para testes
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3001';
  console.log('🧪 Iniciando ambiente de testes Genesis Luminal');
});

afterAll(async () => {
  console.log('🧹 Finalizando ambiente de testes');
});

global.testUtils = {
  createMockRequest: (overrides = {}) => ({
    method: 'GET',
    url: '/',
    headers: {},
    body: {},
    ...overrides
  }),
  createMockResponse: () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  }),
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};
