/**
 * @fileoverview Complete emotion types
 * @version 1.0.0
 */

export interface EmotionalAnalysisRequest {
  text: string;
  timestamp?: Date;
  userId?: string;
  currentState?: string;
}

export interface EmotionAnalysisRequest extends EmotionalAnalysisRequest {}

export interface EmotionalAnalysisResponse {
  dominant: string;
  intensity: number;
  confidence: number;
  processingTime?: number;
  timestamp?: Date | string;
  recommendation?: string;
  dominantAffect?: string;
  emotionalShift?: string;
  morphogenicSuggestion?: string; // ADICIONADO: última propriedade ausente
}

export interface EmotionAnalysisResponse extends EmotionalAnalysisResponse {}
