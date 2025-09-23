/**
 * @fileoverview EmotionalDNA - Definições de estado emocional
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

export interface EmotionalDNA {
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
  disgust: number;
  trust: number;
}

export interface EmotionalState {
  intensity: number;
  valence: number;
  arousal: number;
  timestamp: number;
  dominantAffect?: string;
  confidence?: number;
  resonanceLevel?: number;
}

export interface EmotionalVector extends Array<number> {
  readonly length: 7;
}

export interface EmotionalInput {
  intensity: number;
  valence: number;
  arousal: number;
  timestamp: number;
}

export const DEFAULT_EMOTIONAL_DNA: EmotionalDNA = {
  joy: 0.5,
  sadness: 0.1,
  anger: 0.1,
  fear: 0.1,
  surprise: 0.2,
  disgust: 0.1,
  trust: 0.5
};
