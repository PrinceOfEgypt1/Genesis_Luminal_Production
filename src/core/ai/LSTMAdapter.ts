/**
 * 🔄 LSTM ADAPTER - VERSÃO FUNCIONAL SIMPLES
 * 
 * Adaptador sem dependências externas quebradas
 * Status: FUNCIONAL (sem API Claude)
 */

import { EmotionalDNA } from '../entities/EmotionalDNA';

/**
 * Simulação básica de predição emocional
 * Usado para manter compatibilidade de interface
 */
export class LSTMPredictionEngine {
  private predictionCount = 0;
  private lastPrediction: EmotionalDNA | null = null;

  constructor() {
    console.log('🔄 LSTMAdapter inicializado - Versão local simples');
  }

  /**
   * Predição simples baseada em tendências
   */
  async predict(
    currentEmotionalState: EmotionalDNA,
    mousePosition: { x: number; y: number },
    sessionDuration: number
  ): Promise<EmotionalDNA> {
    
    this.predictionCount++;
    
    try {
      // Predição procedural simples (não é IA real)
      const variation = 0.1;
      const mouseInfluence = {
        joy: mousePosition.x * variation,
        curiosity: mousePosition.y * variation,
        serenity: (1 - Math.abs(mousePosition.x - 0.5)) * variation,
        mystery: (1 - mousePosition.y) * variation,
        power: Math.abs(mousePosition.x - 0.5) * variation,
        nostalgia: Math.sin(sessionDuration * 0.001) * variation * 0.5,
        ecstasy: (mousePosition.x * mousePosition.y) * variation
      };

      const prediction = new EmotionalDNA(
        Math.max(0, Math.min(1, currentEmotionalState.joy + mouseInfluence.joy)),
        Math.max(0, Math.min(1, currentEmotionalState.nostalgia + mouseInfluence.nostalgia)),
        Math.max(0, Math.min(1, currentEmotionalState.curiosity + mouseInfluence.curiosity)),
        Math.max(0, Math.min(1, currentEmotionalState.serenity + mouseInfluence.serenity)),
        Math.max(0, Math.min(1, currentEmotionalState.ecstasy + mouseInfluence.ecstasy)),
        Math.max(0, Math.min(1, currentEmotionalState.mystery + mouseInfluence.mystery)),
        Math.max(0, Math.min(1, currentEmotionalState.power + mouseInfluence.power))
      );

      this.lastPrediction = prediction;
      
      // Log apenas ocasionalmente para não poluir console
      if (this.predictionCount % 50 === 0) {
        console.log(`📊 Predição ${this.predictionCount}: joy=${prediction.joy.toFixed(2)}, curiosity=${prediction.curiosity.toFixed(2)}`);
      }

      return prediction;
    } catch (error) {
      console.warn('⚠️ Erro na predição, mantendo estado atual:', error);
      return currentEmotionalState;
    }
  }

  /**
   * Simulação de treinamento (não faz nada real)
   */
  async train(_dna: EmotionalDNA): Promise<void> {
    // Não faz nada - apenas para compatibilidade de interface
  }

  /**
   * Métricas simuladas
   */
  getMetrics() {
    return {
      accuracy: Math.min(0.95, 0.7 + (this.predictionCount * 0.001)), // Simula melhora com uso
      loss: Math.max(0.05, 0.3 - (this.predictionCount * 0.001)),
      predictions: this.predictionCount,
      source: 'Predição Local Procedural',
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Estado do sistema
   */
  isReady(): boolean {
    return true;
  }
}
