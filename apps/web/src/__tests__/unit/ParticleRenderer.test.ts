import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ParticleRenderer, Particle, Viewport } from '../../infrastructure/visual/ParticleRenderer';

describe('ParticleRenderer', () => {
  let renderer: ParticleRenderer;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    mockContext = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      beginPath: vi.fn(),
      fillStyle: '',
      globalAlpha: 1
    } as any;

    mockCanvas = {
      getContext: vi.fn(() => mockContext),
      width: 800,
      height: 600
    } as any;

    renderer = new ParticleRenderer(mockCanvas);
  });

  it('should render particles correctly', () => {
    const particles: Particle[] = [
      { x: 100, y: 100, color: '#ff0000', size: 5, alpha: 1 },
      { x: 200, y: 200, color: '#00ff00', size: 3, alpha: 0.8 }
    ];

    const viewport: Viewport = { width: 800, height: 600 };
    const result = renderer.render(particles, viewport);

    expect(result.renderedCount).toBe(2);
    expect(result.frameDuration).toBeGreaterThan(0);
    expect(result.fps).toBeGreaterThan(0);
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(mockContext.arc).toHaveBeenCalledTimes(2);
  });

  it('should throw error if canvas context not available', () => {
    const invalidCanvas = {
      getContext: vi.fn(() => null)
    } as any;

    expect(() => {
      new ParticleRenderer(invalidCanvas).render([], { width: 800, height: 600 });
    }).toThrow('Canvas context not available');
  });

  it('should update viewport correctly', () => {
    renderer.updateViewport(1024, 768);
    
    expect(mockCanvas.width).toBe(1024);
    expect(mockCanvas.height).toBe(768);
  });

  it('should dispose resources correctly', () => {
    renderer.dispose();
    
    // Verifica se as referências foram limppas
    expect(() => renderer.render([], { width: 100, height: 100 })).toThrow();
  });
});
