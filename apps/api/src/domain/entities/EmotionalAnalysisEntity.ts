/**
 * Entidade de domínio para análise emocional
 * Representa regras de negócio fundamentais
 */

import type { EmotionalDNA } from '../../../../../packages/shared/types/api';

export class EmotionalAnalysisEntity {
  private constructor(
    public readonly id: string,
    public readonly emotionalState: EmotionalDNA,
    public readonly confidence: number,
    public readonly timestamp: Date,
    public readonly userId?: string,
    public readonly context?: string
  ) {}

  static create(
    emotionalState: EmotionalDNA,
    confidence: number,
    userId?: string,
    context?: string
  ): EmotionalAnalysisEntity {
    // Validações de domínio
    if (confidence < 0 || confidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }

    if (!this.isValidEmotionalDNA(emotionalState)) {
      throw new Error('Invalid EmotionalDNA: all values must be between 0 and 1');
    }

    return new EmotionalAnalysisEntity(
      this.generateId(),
      emotionalState,
      confidence,
      new Date(),
      userId,
      context
    );
  }

  /**
   * Verifica se o estado emocional é válido
   */
  private static isValidEmotionalDNA(dna: EmotionalDNA): boolean {
    const emotions = ['joy', 'nostalgia', 'curiosity', 'serenity', 'ecstasy', 'mystery', 'power'];
    
    return emotions.every(emotion => {
      const value = dna[emotion as keyof EmotionalDNA];
      return typeof value === 'number' && value >= 0 && value <= 1;
    });
  }

  /**
   * Calcula emoção dominante
   */
  getDominantEmotion(): keyof EmotionalDNA {
    const emotions = this.emotionalState;
    let maxEmotion: keyof EmotionalDNA = 'joy';
    let maxValue = emotions.joy;

    (Object.keys(emotions) as Array<keyof EmotionalDNA>).forEach(emotion => {
      if (emotions[emotion] > maxValue) {
        maxValue = emotions[emotion];
        maxEmotion = emotion;
      }
    });

    return maxEmotion;
  }

  /**
   * Calcula intensidade total
   */
  getTotalIntensity(): number {
    const emotions = this.emotionalState;
    const sum = Object.values(emotions).reduce((acc, value) => acc + value, 0);
    return Math.min(sum / 7, 1); // Normalizado entre 0 e 1
  }

  /**
   * Verifica se a análise é confiável
   */
  isReliable(): boolean {
    return this.confidence >= 0.6;
  }

  private static generateId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
