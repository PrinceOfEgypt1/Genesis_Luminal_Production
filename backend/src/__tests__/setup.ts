/**
 * @fileoverview Setup de testes - Backend Genesis Luminal
 */

import 'reflect-metadata';

// Mock global setImmediate se não existir
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = (fn: (...args: any[]) => void, ...args: any[]): NodeJS.Timeout => {
    return global.setTimeout(fn, 0, ...args);
  };
}

// Setup de testes Jest
beforeEach(() => {
  jest.clearAllMocks();
});
