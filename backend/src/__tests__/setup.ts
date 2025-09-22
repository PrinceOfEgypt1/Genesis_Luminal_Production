/**
 * @fileoverview Test setup configuration
 * @version 1.0.0
 */

// Mock completo do setImmediate com __promisify__
const setImmediateWithPromisify = Object.assign(
  (fn: (...args: any[]) => void, ...args: any[]): NodeJS.Timeout => {
    return setTimeout(() => fn(...args), 0) as NodeJS.Timeout;
  },
  {
    __promisify__: (value?: any) => Promise.resolve(value)
  }
);

(global as any).setImmediate = setImmediateWithPromisify;

// Configuração adicional de mocks
