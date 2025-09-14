/**
 * Adapter que implementa IEmotionalAnalyzer usando ClaudeService existente
 * Implementa DIP - Dependency Inversion Principle
 */

import { IEmotionalAnalyzer } from '../../domain/interfaces/IEmotionalAnalyzer';
import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../../packages/shared/types/api';
import claudeServiceInstance from '../../services/ClaudeService';

export class EmotionalAnalyzerAdapter implements IEmotionalAnalyzer {
  private claudeService: any;

  constructor(claudeService?: any) {
    this.claudeService = claudeService || claudeServiceInstance;
  }

  async analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    return await this.claudeService.analyzeEmotionalState(request);
  }

  getStatus(): { ok: boolean; provider: string } {
    const status = this.claudeService.status();
    
    return {
      ok: status.ok,
      provider: status.provider || 'unknown'
    };
  }
}
