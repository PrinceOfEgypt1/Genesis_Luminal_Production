/**
 * @fileoverview Adaptador para API Claude Real
 * 
 * VERSÃO SIMPLIFICADA para teste de integração
 */

import { SimpleClaudeClient } from './SimpleClaudeClient';

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
 * Adaptador que usa API Claude Real (versão simplificada)
 */
export class LSTMPredictionEngine {
  private claudeClient: SimpleClaudeClient;

  constructor() {
    this.claudeClient = new SimpleClaudeClient();
    console.log('🔄 Adaptador: Usando API Claude REAL (não mais LSTM local)');
  }

  async addEmotionalState(dna: EmotionalDNA): Promise<void> {
    await this.claudeClient.addEmotionalState(dna);
  }

  async predictNextState(): Promise<EmotionalPrediction | null> {
    return await this.claudeClient.predictNextState();
  }

  getMetrics() {
    return this.claudeClient.getMetrics();
  }
}
