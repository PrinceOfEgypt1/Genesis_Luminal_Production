/**
 * Adapter que implementa IEmotionalAnalyzer usando ClaudeService existente
 * Implementa DIP - Dependency Inversion Principle
 */

import { IEmotionalAnalyzer } from '../../domain/interfaces/IEmotionalAnalyzer';
import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../../packages/shared/types/api';
import claudeService from '../../services/ClaudeService';

export class EmotionalAnalyzerAdapter implements IEmotionalAnalyzer {
  constructor(private readonly claudeService = claudeService) {}

  async analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    // Delega para o ClaudeService existente
    return await this.claudeService.analyzeEmotionalState(request);
  }

  getStatus(): { ok: boolean; provider: string } {
    // Delega para o ClaudeService existente
    const status = this.claudeService.status();
    
    return {
      ok: status.ok,
      provider: status.provider || 'unknown'
    };
  }
}
