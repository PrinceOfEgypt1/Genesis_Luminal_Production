import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../packages/shared/types/api';
import { logger } from '../utils/logger';

export interface AIProvider {
  analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse>;
  status(): { ok: boolean; provider: string };
}

export abstract class BaseAIProvider implements AIProvider {
  protected abstract name: string;

  abstract analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse>;

  status(): { ok: boolean; provider: string } {
    return { ok: true, provider: this.name };
  }

  protected logRequest(request: EmotionalAnalysisRequest): void {
    logger.info(`${this.name} processing request`, { 
      hasText: 'text' in request ? request.text.length > 0 : false,
      hasState: 'currentState' in request
    });
  }

  protected createDefaultResponse(): EmotionalAnalysisResponse {
    return {
      intensity: 0.5,
      dominantAffect: 'neutral',
      timestamp: new Date().toISOString(),
      confidence: 0.5,
      recommendation: 'continue',
      emotionalShift: 'stable',
      morphogenicSuggestion: 'fibonacci'
    };
  }
}
