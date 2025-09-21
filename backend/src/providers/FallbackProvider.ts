import type { AIProvider } from './AIProvider';
import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../shared/types/api';

export class FallbackProvider implements AIProvider {
  name = 'fallback';

  async analyze(_input: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    const now = new Date().toISOString();
    return {
      intensity: 0.5,
      timestamp: now,
      confidence: 0.5,
      recommendation: 'continue',
      emotionalShift: 'stable',
      morphogenicSuggestion: 'fibonacci',
    };
  }
}

