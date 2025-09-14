/**
 * Emotional Analysis Service Interface - Application Layer
 * IMPLEMENTADO: Interface para serviços de análise emocional
 */

import { EmotionalAnalysisEntity } from '../../domain/entities/EmotionalAnalysisEntity';

export interface ITextAnalysisRequest {
  text: string;
}

export interface IBehavioralAnalysisRequest {
  emotionalState: {
    morphogeneticField: number;
    resonancePatterns: number[];
    quantumCoherence: number;
  };
  mousePosition: {
    x: number;
    y: number;
  };
  sessionDuration: number;
  userId?: string;
}

export interface IEmotionalAnalysisService {
  analyzeText(request: ITextAnalysisRequest): Promise<EmotionalAnalysisEntity>;
  analyzeBehavior(request: IBehavioralAnalysisRequest): Promise<EmotionalAnalysisEntity>;
}
