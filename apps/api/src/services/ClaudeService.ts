/**
 * Claude Service - TRILHO B Ação 6
 * Service principal com dependencies corrigidas
 */

import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../types/shared';
import { ProviderRouter } from '../providers/ProviderRouter';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

export class ClaudeService {
  private router: ProviderRouter;

  constructor() {
    this.router = new ProviderRouter(config.CLAUDE_API_KEY);
  }

  async analyzeEmotionalState(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    try {
      logger.info('Analyzing emotional state');
      
      const response = await this.router.analyze(request);
      
      // ✅ Garantir que response tenha success property
      return {
        success: true, // ✅ ADICIONADO
        ...response
      };

    } catch (error) {
      logger.error('Claude service error:', error);
      throw error;
    }
  }

  // ✅ MÉTODOS CORRETOS
  async getProviderStatus(): string {
    return this.router.getCurrentProvider().getProviderName();
  }

  async switchToFallback(): Promise<string> {
    const provider = this.router.switchToFallback();
    return provider.getProviderName();
  }

  async isHealthy(): Promise<boolean> {
    return await this.router.isHealthy();
  }
}
