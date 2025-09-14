import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse, EmotionalDNA } from '../../../../packages/shared/types/api';
import { logger } from '../utils/logger';

export interface AIProvider {
  analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse>;
  getStatus(): { ok: boolean; provider: string };
}

export function extractTextFromRequest(request: EmotionalAnalysisRequest): string {
  // ✅ CORREÇÃO: Type assertion segura para compatibilidade
  const input = request as any;
  const text = input?.text || input?.message || input?.prompt || '';
  return typeof text === 'string' ? text.trim() : '';
}

export function createValidationInfo(request: EmotionalAnalysisRequest) {
  const text = extractTextFromRequest(request);
  
  return {
    hasCurrentState: 'currentState' in request && request.currentState !== undefined,
    hasMousePosition: 'mousePosition' in request && request.mousePosition !== undefined,
    hasText: text.length > 0,
    textLength: text.length,
    requestType: text.length > 0 ? 'text_analysis' : 'state_analysis'
  };
}

export function createFallbackResponse(): EmotionalAnalysisResponse {
  // ✅ CORREÇÃO: Usar EmotionalAffect válido
  const validEmotionalAffects: (keyof EmotionalDNA)[] = ['joy', 'nostalgia', 'curiosity', 'serenity', 'ecstasy', 'mystery', 'power'];
  const randomAffect = validEmotionalAffects[Math.floor(Math.random() * validEmotionalAffects.length)];
  
  return {
    intensity: 0.5,
    dominantAffect: randomAffect, // ✅ Agora é keyof EmotionalDNA válido
    timestamp: new Date().toISOString(),
    confidence: 0.3,
    recommendation: 'exploring_curiosity',
    emotionalShift: 'stable',
    morphogenicSuggestion: 'fibonacci'
  };
}
