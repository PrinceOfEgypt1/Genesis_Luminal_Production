/**
 * Interface de repositório para dados emocionais
 * Abstrai persistência de dados emocionais
 */

import type { EmotionalDNA } from '@/shared/types/api';

export interface IEmotionalRepository {
  /**
   * Salva análise emocional
   */
  saveAnalysis(userId: string, analysis: EmotionalAnalysis): Promise<void>;
  
  /**
   * Recupera histórico emocional do usuário
   */
  getUserHistory(userId: string, limit?: number): Promise<EmotionalAnalysis[]>;
  
  /**
   * Busca padrões emocionais comuns
   */
  findEmotionalPatterns(): Promise<EmotionalPattern[]>;
}

export interface EmotionalAnalysis {
  id: string;
  userId: string;
  emotionalState: EmotionalDNA;
  timestamp: Date;
  confidence: number;
  context?: string;
}

export interface EmotionalPattern {
  pattern: string;
  frequency: number;
  averageConfidence: number;
  emotionalStates: EmotionalDNA[];
}
