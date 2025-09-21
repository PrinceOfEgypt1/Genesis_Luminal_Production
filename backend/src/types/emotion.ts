/**
 * @fileoverview Tipos para análise de emoções - Genesis Luminal
 * @version 1.0.0
 */

export interface EmotionAnalysisRequest {
  text: string;
  context?: string;
  userId?: string;
  timestamp?: Date;
}

export interface EmotionAnalysisResult {
  intensity: number;        // 0-1
  dominantAffect: string;   // joy, anger, sadness, etc
  confidence: number;       // 0-1
  emotions: {
    [key: string]: number;  // emotion name -> intensity
  };
  metadata?: {
    provider: string;
    processingTime: number;
    version: string;
    model?: string;
    isSimulated?: boolean;  // ADICIONADO
    [key: string]: any;     // ADICIONADO: permite propriedades extras
  };
}

export interface EmotionProvider {
  name: string;
  analyze(request: EmotionAnalysisRequest): Promise<EmotionAnalysisResult>;
}

// Interface AIProvider para compatibilidade
export interface AIProvider {
  name: string;
  analyze(request: EmotionAnalysisRequest): Promise<EmotionAnalysisResult>;
}
