/**
 * @fileoverview Adaptador para IA Real Claude
 * 
 * Mantém interface compatível mas usa IA genuína por baixo.
 * SUBSTITUI completamente simulações por inteligência real.
 */

import { RealAIEngine } from './RealAIEngine';

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
 * Adaptador que usa IA REAL do Claude
 * ✅ NENHUMA SIMULAÇÃO - apenas IA genuína
 */
export class LSTMPredictionEngine {
  private realAI: RealAIEngine;

  constructor() {
    this.realAI = new RealAIEngine();
    console.log('🧠 Adaptador: Usando IA REAL Claude (zero simulação)');
  }

  /**
   * Interface compatível - mas usa IA real
   */
  async addEmotionalState(dna: EmotionalDNA): Promise<void> {
    await this.realAI.addEmotionalState(dna);
  }

  /**
   * Interface compatível - mas usa IA real
   */
  async predictNextState(): Promise<EmotionalPrediction | null> {
    return await this.realAI.predictNextState();
  }

  /**
   * Métricas da IA real
   */
  getMetrics() {
    const realMetrics = this.realAI.getMetrics();
    return {
      accuracy: realMetrics.accuracy,
      historySize: realMetrics.historySize,
      maxHistorySize: realMetrics.maxHistorySize,
      isReady: realMetrics.isReady,
      // Indicadores de IA real
      isRealAI: true,
      aiType: 'Claude API',
      status: realMetrics.status,
      note: 'IA genuína da Anthropic, não simulação'
    };
  }

  /**
   * Recomendações da IA real
   */
  async getPersonalizedRecommendations(): Promise<any> {
    return await this.realAI.getPersonalizedRecommendations();
  }

  /**
   * Status
   */
  isRealAI(): boolean {
    return this.realAI.isRealAI();
  }
}
