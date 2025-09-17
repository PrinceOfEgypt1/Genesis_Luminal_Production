import { vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom'

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock AudioContext
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { setValueAtTime: vi.fn() },
    type: 'sine'
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn() }
  })),
  destination: {},
  currentTime: 0,
  sampleRate: 44100,
  close: vi.fn(),
  suspend: vi.fn(),
  resume: vi.fn()
}

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: vi.fn(() => mockAudioContext),
})

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: vi.fn(() => mockAudioContext),
})

// Mock Tone.js
vi.mock('tone', () => ({
  default: {
    start: vi.fn(),
    Transport: {
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn()
    }
  },
  Synth: vi.fn().mockImplementation(() => ({
    toDestination: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
    dispose: vi.fn()
  })),
  Filter: vi.fn().mockImplementation(() => ({
    frequency: { setValueAtTime: vi.fn() },
    dispose: vi.fn()
  })),
  Destination: {},
  now: vi.fn(() => 0)
}))

// Mock TensorFlow.js
vi.mock('@tensorflow/tfjs', () => ({
  sequential: vi.fn(() => ({
    add: vi.fn(),
    compile: vi.fn(),
    fit: vi.fn().mockResolvedValue({}),
    predict: vi.fn(() => ({
      dataSync: vi.fn(() => [0.5, 0.3, 0.2]),
      dispose: vi.fn()
    })),
    dispose: vi.fn()
  })),
  layers: {
    lstm: vi.fn(),
    dense: vi.fn(),
    dropout: vi.fn()
  },
  tensor2d: vi.fn(() => ({
    dispose: vi.fn()
  })),
  dispose: vi.fn(),
  memory: vi.fn(() => ({ numTensors: 0 }))
}))

// Mock Canvas Context
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    beginPath: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(4)
    }))
  }))
})

// Mock requestAnimationFrame
Object.defineProperty(window, 'requestAnimationFrame', {
  value: vi.fn(cb => setTimeout(cb, 16))
})

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: vi.fn()
})

// Mock Performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000
    },
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => [])
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})

// Clean up after each test
afterEach(() => {
  vi.clearAllTimers()
})
