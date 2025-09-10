/**
 * @fileoverview Adaptador para migração suave de SimpleLSTM → RealLSTM
 * 
 * Mantém interface compatível para não quebrar código existente
 * enquanto usa implementação REAL por baixo.
 */

import { RealLSTMEngine } from './RealLSTMEngine';

interface EmotionalDNA {
  joy: number; nostalgia: number; curiosity: number; serenity: number;
  ecstasy: number; mystery: number; power: number;
}

interface EmotionalPrediction {
  predictedEmotion: EmotionalDNA;
  confidence: number;
  timeHorizon: number;
  reasoning: string;
}

/**
 * Adaptador que expõe interface compatível com SimpleLSTM
 * mas usa RealLSTMEngine por baixo
 */
export class LSTMPredictionEngine {
  private realEngine: RealLSTMEngine;

  constructor() {
    this.realEngine = new RealLSTMEngine();
    console.log('🔄 Adaptador LSTM: Usando implementação REAL');
  }

  /**
   * Interface compatível com código existente
   */
  addEmotionalState(dna: EmotionalDNA): void {
    this.realEngine.addEmotionalState(dna);
  }

  /**
   * Interface compatível com código existente
   */
  async predictNextState(): Promise<EmotionalPrediction | null> {
    return await this.realEngine.predictNextState();
  }

  /**
   * Interface compatível com código existente
   * Agora retorna métricas REAIS
   */
  getMetrics() {
    const realMetrics = this.realEngine.getMetrics();
    return {
      accuracy: realMetrics.accuracy,
      historySize: realMetrics.historySize,
      maxHistorySize: 100,
      isReady: realMetrics.isReady,
      // Flags para indicar que agora é real
      isRealML: true,
      modelType: 'TensorFlow.js LSTM',
      trainingEpochs: realMetrics.epochs
    };
  }

  /**
   * Limpar recursos
   */
  dispose(): void {
    this.realEngine.dispose();
  }
}
