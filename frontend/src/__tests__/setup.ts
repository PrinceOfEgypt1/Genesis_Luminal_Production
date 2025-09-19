/**
 * Test Setup - Genesis Luminal Frontend
 * Configuração científica para testes com Vitest
 * SEM dependência de globals vi para evitar erros TypeScript
 */

import { beforeEach, afterEach, vi } from 'vitest'

// ✅ IMPORT EXPLÍCITO do vi - sem dependência de globals

// Mock GenesisCore
const mockGenesisCore = {
  init: vi.fn(),
  destroy: vi.fn(), 
  updateEmotionalState: vi.fn(),
  getCurrentState: vi.fn(() => ({
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
Object.defineProperty(globalThis, 'THREE', {
  value: {
    WebGLRenderer: vi.fn(),
    Scene: vi.fn(),
    PerspectiveCamera: vi.fn(),
    Vector3: vi.fn(),
    Mesh: vi.fn(),
    SphereGeometry: vi.fn(),
    MeshBasicMaterial: vi.fn()
  }
});

// Mock WebGL context
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    getExtension: vi.fn(),
    viewport: vi.fn(),
    clear: vi.fn(),
    clearColor: vi.fn()
  }))
});

// Mock requestAnimationFrame
Object.defineProperty(globalThis, 'requestAnimationFrame', {
  value: vi.fn((cb: any) => setTimeout(cb, 16))
});

// Mock performance API
Object.defineProperty(globalThis, 'performance', {
  value: {
    now: vi.fn(() => Date.now())
  }
});

// Setup e cleanup para cada teste
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

export { mockGenesisCore };
