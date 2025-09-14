import '@testing-library/jest-dom'

// Mock básico para WebGL/Canvas
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () => ({
    clearRect: () => {},
    fillRect: () => {},
    arc: () => {},
    fill: () => {},
    beginPath: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    scale: () => {},
    fillStyle: '',
    globalAlpha: 1
  })
})

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb) => {
  setTimeout(cb, 16)
  return 1
}

global.cancelAnimationFrame = () => {}

// Mock AudioContext
global.AudioContext = class {
  createOscillator() {
    return {
      connect: () => {},
      start: () => {},
      stop: () => {},
      frequency: { value: 440 }
    }
  }
  createGain() {
    return {
      connect: () => {},
      gain: { value: 1 }
    }
  }
  destination = {}
}
