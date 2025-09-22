import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../types/emotion';

export interface AIProvider {
  name: string;
  analyze(input: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse>;
}

