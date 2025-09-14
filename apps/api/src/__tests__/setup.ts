/**
 * Jest Setup - TRILHO B Ação 6
 * Setup corrigido para resolver type errors
 */

import { config } from '../config/environment';

// Mock Redis client
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn().mockResolvedValue(true), // ✅ CORRIGIDO: valor boolean
    get: jest.fn(),
    set: jest.fn(),
    setEx: jest.fn(),
    exists: jest.fn(),
    flushAll: jest.fn()
  }))
}));

// Mock logger
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

// Set test environment
process.env.NODE_ENV = 'test';
process.env.CLAUDE_API_KEY = 'test-key';

// Setup test timeout
jest.setTimeout(10000);
