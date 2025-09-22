/**
 * @fileoverview Local emotion types
 * @version 1.0.0
 */

export interface EmotionalAnalysisRequest {
  text: string;
  timestamp?: Date;
  userId?: string;
}

export interface EmotionalAnalysisResponse {
  dominant: string;
  intensity: number;
  confidence: number;
  processingTime?: number;
}
