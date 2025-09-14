/**
 * TIPOS LOCAIS - ClaudeResponseMapper
 * Definições locais para evitar imports quebrados
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface EmotionalDNA {
  joy: number;
  nostalgia: number;
  curiosity: number;
  serenity: number;
  ecstasy: number;
  mystery: number;
  power: number;
}

export type EmotionalAffect = keyof EmotionalDNA;

export interface EmotionalAnalysisRequest {
  currentState: EmotionalDNA;
  mousePosition: Vector2D;
  sessionDuration: number;
  userId?: string;
}

export interface EmotionalAnalysisResponse {
  success: boolean;
  intensity: number;
  dominantAffect: EmotionalAffect;
  timestamp: string;
  confidence: number;
  recommendation: string;
  emotionalShift?: string;
  morphogenicSuggestion?: string;
  error?: any;
}
