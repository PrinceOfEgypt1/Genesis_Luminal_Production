/**
 * Sistema de partículas ultra-otimizado para 60+ FPS
 */

export interface UltraOptimizedParticle {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  hue: number; size: number; life: number;
  visible: boolean; lodLevel: number;
}

export class UltraOptimizedParticleSystem {
  private particles: UltraOptimizedParticle[] = [];
  private visibleParticles: UltraOptimizedParticle[] = [];
  private frameCount: number = 0;
  
  constructor(count: number = 2000) {
    this.initializeParticles(count);
  }
  
  private initializeParticles(count: number): void {
    this.particles = new Array(count);
    
    for (let i = 0; i < count; i++) {
      // Fibonacci sphere distribution otimizada
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const radius = 80 + Math.sin(phi * 6) * 30;
      
      this.particles[i] = {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.3,
        hue: Math.random() * 360,
        size: Math.random() * 4 + 0.5,
        life: Math.random(),
        visible: true,
        lodLevel: 0
      };
    }
  }
  
  /**
   * Update ultra-otimizado com early returns
   */
  updateParticles(
    mouseX: number, 
    mouseY: number, 
    intensity: number, 
    targetFPS: number = 60
  ): UltraOptimizedParticle[] {
    this.frameCount++;
    
    // Skip frames se performance baixa
    const skipRate = targetFPS < 50 ? 2 : 1;
    if (this.frameCount % skipRate !== 0) {
      return this.visibleParticles;
    }
    
    this.visibleParticles.length = 0;
    const maxVisible = targetFPS < 50 ? 1000 : 2000;
    let visibleCount = 0;
    
    for (let i = 0; i < this.particles.length && visibleCount < maxVisible; i++) {
      const p = this.particles[i];
      
      // LOD simples baseado no índice
      p.lodLevel = i % 3; // 0, 1, 2
      
      // Skip partículas LOD alto se performance baixa
      if (targetFPS < 50 && p.lodLevel > 1) continue;
      
      // Update simplificado
      const timeOffset = Date.now() * 0.001;
      p.x += p.vx + Math.sin(timeOffset + p.x * 0.01) * intensity * 0.5;
      p.y += p.vy + Math.cos(timeOffset + p.y * 0.01) * intensity * 0.3;
      p.z += p.vz;
      
      // Containment simples
      const dist = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
      if (dist > 250) {
        p.x *= 0.95;
        p.y *= 0.95;
        p.z *= 0.95;
      }
      
      p.visible = true;
      this.visibleParticles[visibleCount++] = p;
    }
    
    return this.visibleParticles;
  }
}
