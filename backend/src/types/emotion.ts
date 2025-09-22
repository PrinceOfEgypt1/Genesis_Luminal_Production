/**
 * @fileoverview Complete emotion types for backend compatibility
 * @version 1.0.0
 */

export interface EmotionalAnalysisRequest {
  text: string;
  timestamp?: Date;
  userId?: string;
  currentState?: string; // Usado em emotional.ts
}

// Alias para compatibilidade com fixtures
export interface EmotionAnalysisRequest extends EmotionalAnalysisRequest {}

export interface EmotionalAnalysisResponse {
  dominant: string;
  intensity: number;
  confidence: number;
  processingTime?: number;
  timestamp?: Date | string; // Usado em múltiplos arquivos
  recommendation?: string; // Usado em emotional.ts
  dominantAffect?: string; // Usado em emotional.ts
}

// Alias para compatibilidade
export interface EmotionAnalysisResponse extends EmotionalAnalysisResponse {}

export default {
  EmotionalAnalysisRequest,
  EmotionalAnalysisResponse,
  EmotionAnalysisRequest,
  EmotionAnalysisResponse
};
