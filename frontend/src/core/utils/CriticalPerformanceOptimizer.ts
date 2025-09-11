/**
 * 🚨 OTIMIZADOR CRÍTICO DE PERFORMANCE
 * Resolve problema FPS 8-10 → 60+ FPS
 */

export class CriticalPerformanceOptimizer {
  private currentFPS: number = 60;
  private particleCount: number = 2000;
  private adaptiveQuality: number = 1.0;
  private frameSkipCounter: number = 0;
  
  /**
   * Atualiza FPS e ajusta qualidade drasticamente se necessário
   */
  updateFPS(fps: number): void {
    this.currentFPS = fps;
    
    // EMERGÊNCIA: FPS < 15
    if (fps < 15) {
      this.adaptiveQuality = 0.3;
      this.particleCount = 500;
    }
    // CRÍTICO: FPS < 30
    else if (fps < 30) {
      this.adaptiveQuality = 0.5;
      this.particleCount = 1000;
    }
    // BAIXO: FPS < 50
    else if (fps < 50) {
      this.adaptiveQuality = 0.7;
      this.particleCount = 1500;
    }
    // NORMAL: FPS >= 50
    else {
      this.adaptiveQuality = Math.min(1.0, this.adaptiveQuality + 0.05);
      this.particleCount = Math.min(2000, this.particleCount + 50);
    }
  }
  
  /**
   * Determina se deve pular o frame atual
   */
  shouldSkipFrame(): boolean {
    if (this.currentFPS < 20) {
      this.frameSkipCounter++;
      return this.frameSkipCounter % 3 !== 0; // Renderizar apenas 1 a cada 3 frames
    }
    if (this.currentFPS < 40) {
      this.frameSkipCounter++;
      return this.frameSkipCounter % 2 !== 0; // Renderizar apenas 1 a cada 2 frames
    }
    return false;
  }
  
  /**
   * Configurações otimizadas para performance crítica
   */
  getOptimizedSettings(): {
    particleCount: number;
    skipFrame: boolean;
    webglEnabled: boolean;
    lodLevel: number;
    updateInterval: number;
  } {
    return {
      particleCount: Math.floor(this.particleCount),
      skipFrame: this.shouldSkipFrame(),
      webglEnabled: this.currentFPS > 30,
      lodLevel: this.currentFPS < 30 ? 2 : (this.currentFPS < 50 ? 1 : 0),
      updateInterval: this.currentFPS < 20 ? 100 : (this.currentFPS < 40 ? 50 : 16)
    };
  }
  
  /**
   * Limpar recursos pesados se necessário
   */
  emergencyCleanup(): void {
    if (this.currentFPS < 10) {
      this.particleCount = 200;
      this.adaptiveQuality = 0.1;
      console.warn('🚨 LIMPEZA EMERGENCIAL ATIVADA');
    }
  }
}
