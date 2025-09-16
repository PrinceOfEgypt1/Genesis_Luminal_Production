/**
 * Setup para testes - Genesis Luminal [CORRIGIDO]
 * Mocks necessários para ambiente de teste
 */

// Mock do AudioContext para testes
class MockAudioContext {
  constructor() {}
  
  createOscillator() {
    return {
      frequency: { value: 440 },
      type: 'sine',
      connect: () => {},
      start: () => {},
      stop: () => {}
    };
  }
  
  createGain() {
    return {
      gain: { value: 1 },
      connect: () => {}
    };
  }
  
  get destination() {
    return {};
  }
  
  close() {
    return Promise.resolve();
  }
  
  get baseLatency() { return 0; }
  get outputLatency() { return 0; }
  createMediaElementSource() { return {}; }
  createAnalyser() { return {}; }
}

// ✅ CORREÇÃO: Tipagem correta do AudioContext
(global as any).AudioContext = MockAudioContext;
(global as any).webkitAudioContext = MockAudioContext;

// Mock do Canvas para Three.js
const mockCanvas = {
  getContext: () => ({
    fillRect: () => {},
    clearRect: () => {},
    getImageData: () => ({ data: new Array(4) }),
    putImageData: () => {},
    createImageData: () => [],
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {}
  }),
  width: 800,
  height: 600
};

(global as any).HTMLCanvasElement.prototype.getContext = () => mockCanvas.getContext();

// Mock do WebGL
(global as any).WebGLRenderingContext = function() {};

export {};
