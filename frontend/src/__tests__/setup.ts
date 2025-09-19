/**
 * Test Setup - Genesis Luminal Frontend
 * Configuração global para testes com Jest
 */

import { beforeEach, afterEach } from '@jest/globals';

// Global mocks para ambiente de teste
const mockGenesisCore = {
  init: jest.fn(),
  destroy: jest.fn(),
  updateEmotionalState: jest.fn(),
  getCurrentState: jest.fn(() => ({
    joy: 0.5,
    nostalgia: 0.3,
    curiosity: 0.7,
    serenity: 0.4,
    ecstasy: 0.2,
    mystery: 0.6,
    power: 0.5
  }))
};

// Mock Three.js
Object.defineProperty(global, 'THREE', {
  value: {
    WebGLRenderer: jest.fn(),
    Scene: jest.fn(),
    PerspectiveCamera: jest.fn(),
    Vector3: jest.fn(),
    Mesh: jest.fn(),
    SphereGeometry: jest.fn(),
    MeshBasicMaterial: jest.fn()
  }
});

// Mock WebGL context
Object.defineProperty(global, 'HTMLCanvasElement', {
  value: {
    prototype: {
      getContext: jest.fn(() => ({
        getExtension: jest.fn(),
        viewport: jest.fn(),
        clear: jest.fn(),
        clearColor: jest.fn()
      }))
    }
  }
});

// Mock requestAnimationFrame
Object.defineProperty(global, 'requestAnimationFrame', {
  value: jest.fn((cb: any) => setTimeout(cb, 16))
});

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => Date.now())
  }
});

// Setup e cleanup para cada teste
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

export { mockGenesisCore };
