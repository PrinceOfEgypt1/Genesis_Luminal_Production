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
   * Removidos parâmetros não utilizados mouseX e mouseY
   */
  updateParticles(
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
    
    for (let i = 0; i < this.particles.length && this.visibleParticles.length < maxVisible; i++) {
      const particle = this.particles[i];
      
      // Update posição
      particle.x += particle.vx * intensity;
      particle.y += particle.vy * intensity;
      particle.z += particle.vz * intensity;
      
      // Update vida da partícula
      particle.life += 0.01;
      if (particle.life > 1) {
        particle.life = 0;
        // Reset posição
        const phi = Math.acos(-1 + (2 * i) / this.particles.length);
        const theta = Math.sqrt(this.particles.length * Math.PI) * phi;
        const radius = 80 + Math.sin(phi * 6) * 30;
        
        particle.x = radius * Math.sin(phi) * Math.cos(theta);
        particle.y = radius * Math.sin(phi) * Math.sin(theta);
        particle.z = radius * Math.cos(phi);
      }
      
      // Update cor baseada na intensidade
      particle.hue = (particle.hue + intensity * 0.5) % 360;
      
      // LOD simples
      const distance = Math.sqrt(particle.x * particle.x + particle.y * particle.y + particle.z * particle.z);
      particle.visible = distance < 200;
      particle.lodLevel = distance < 100 ? 0 : distance < 150 ? 1 : 2;
      
      if (particle.visible) {
        this.visibleParticles.push(particle);
      }
    }
    
    return this.visibleParticles;
  }
  
  getParticles(): UltraOptimizedParticle[] {
    return this.visibleParticles;
  }
  
  getParticleCount(): number {
    return this.visibleParticles.length;
  }
  
  /**
   * Otimização: reduzir número de partículas se necessário
   */
  optimizeForPerformance(targetFPS: number): void {
    if (targetFPS < 45 && this.particles.length > 1000) {
      this.particles = this.particles.slice(0, Math.floor(this.particles.length * 0.8));
      console.log(`🔧 Partículas reduzidas para: ${this.particles.length}`);
    }
  }
}
