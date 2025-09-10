/**
 * @fileoverview Otimizações Finais de Performance
 * Sistema para atingir 60+ FPS consistentes
 */

export class PerformanceOptimizer {
  private particleCount: number = 2000;
  
  /**
   * Otimização principal: reduzir partículas se FPS < 50
   */
  optimizeParticleCount(currentFPS: number): number {
    if (currentFPS < 50) {
      this.particleCount = Math.max(1000, this.particleCount * 0.9);
      console.log(`🔧 Partículas reduzidas para: ${this.particleCount}`);
    } else if (currentFPS > 58 && this.particleCount < 2000) {
      this.particleCount = Math.min(2000, this.particleCount * 1.05);
    }
    
    return Math.floor(this.particleCount);
  }
  
  /**
   * LOD agressivo baseado na performance
   */
  getOptimalLOD(currentFPS: number): { skipFrames: number; maxParticles: number } {
    if (currentFPS < 45) {
      return { skipFrames: 3, maxParticles: 1000 };
    } else if (currentFPS < 55) {
      return { skipFrames: 2, maxParticles: 1500 };
    } else {
      return { skipFrames: 1, maxParticles: 2000 };
    }
  }
  
  /**
   * Otimização de renderização em tempo real
   */
  shouldRenderFrame(frameCount: number, targetFPS: number): boolean {
    const skipRate = Math.max(1, Math.floor(60 / targetFPS));
    return frameCount % skipRate === 0;
  }
  
  /**
   * Retorna configurações otimizadas atuais
   */
  getOptimizedSettings(currentFPS: number): {
    particleCount: number;
    skipFrames: number;
    enableEffects: boolean;
  } {
    const lod = this.getOptimalLOD(currentFPS);
    
    return {
      particleCount: this.optimizeParticleCount(currentFPS),
      skipFrames: lod.skipFrames,
      enableEffects: currentFPS > 45
    };
  }
  
  /**
   * Reset configurações para valores padrão
   */
  resetToDefaults(): void {
    this.particleCount = 2000;
  }
}