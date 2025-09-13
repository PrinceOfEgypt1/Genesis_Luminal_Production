import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../shared/types/api';

export interface AIProvider {
  name: string;
  analyze(input: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse>;
}
