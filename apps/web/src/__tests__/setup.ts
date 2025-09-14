import '@testing-library/jest-dom';

// Mock do Tone.js para evitar problemas com Web Audio API nos testes
vi.mock('tone', () => ({
  PolySynth: vi.fn().mockImplementation(() => ({
    triggerAttackRelease: vi.fn(),
    chain: vi.fn(),
    dispose: vi.fn()
  })),
  Reverb: vi.fn().mockImplementation(() => ({
    generate: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn()
  })),
  Filter: vi.fn().mockImplementation(() => ({
    frequency: { setValueAtTime: vi.fn() },
    dispose: vi.fn()
  })),
  Destination: {},
  now: vi.fn(() => 0)
}));

// Mock do Canvas 2D Context
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    beginPath: vi.fn(),
    fillStyle: '',
    globalAlpha: 1
  }))
});

// Mock das APIs do navegador
Object.defineProperty(window, 'requestAnimationFrame', {
  value: vi.fn(cb => setTimeout(cb, 16))
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: vi.fn()
});

// Performance mock
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 1000000
    }
  }
});
