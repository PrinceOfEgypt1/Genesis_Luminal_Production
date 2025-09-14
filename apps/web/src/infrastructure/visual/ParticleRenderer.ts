/**
 * Responsabilidade ÚNICA: Renderização de partículas
 * Implementa SRP - Single Responsibility Principle
 */

export class ParticleRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
  }

  render(particles: Particle[], viewport: Viewport): RenderResult {
    if (!this.context) throw new Error('Canvas context not available');

    // APENAS renderizar - nenhuma outra responsabilidade
    this.context.clearRect(0, 0, viewport.width, viewport.height);
    
    let renderedCount = 0;
    const startTime = performance.now();

    particles.forEach(particle => {
      this.renderParticle(particle);
      renderedCount++;
    });

    const frameDuration = performance.now() - startTime;
    
    return { 
      renderedCount, 
      frameDuration,
      fps: Math.round(1000 / frameDuration)
    };
  }

  private renderParticle(particle: Particle): void {
    if (!this.context) return;

    // Implementação focada apenas em desenhar a partícula
    const { x, y, color, size, alpha } = particle;
    
    this.context.save();
    this.context.globalAlpha = alpha;
    this.context.fillStyle = color;
    this.context.beginPath();
    this.context.arc(x, y, size, 0, Math.PI * 2);
    this.context.fill();
    this.context.restore();
  }

  updateViewport(width: number, height: number): void {
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  dispose(): void {
    this.canvas = null;
    this.context = null;
  }
}

export interface Particle {
  x: number;
  y: number;
  color: string;
  size: number;
  alpha: number;
  id?: string;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface RenderResult {
  renderedCount: number;
  frameDuration: number;
  fps: number;
}
