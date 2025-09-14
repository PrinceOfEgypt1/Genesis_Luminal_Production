import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../packages/shared/types/api';
import { AnthropicProvider } from './AnthropicProvider';
import { FallbackProvider } from './FallbackProvider';
import { logger } from '../utils/logger';
import { config } from '../config/environment';

export class ProviderRouter {
  private anthropicProvider: AnthropicProvider;
  private fallbackProvider: FallbackProvider;
  private currentProvider: 'anthropic' | 'fallback';

  constructor() {
    this.anthropicProvider = new AnthropicProvider();
    this.fallbackProvider = new FallbackProvider();
    
    // ✅ CORREÇÃO: Usar config.CLAUDE_OFFLINE_MODE que agora existe
    if (config.CLAUDE_API_KEY && !config.CLAUDE_OFFLINE_MODE) {
      this.currentProvider = 'anthropic';
      logger.info('Using Anthropic provider');
    } else {
      this.currentProvider = 'fallback';
      if (config.CLAUDE_OFFLINE_MODE) {
        logger.info('Claude offline mode enabled, using fallback provider');
      } else {
        logger.warn('Claude API key not configured, using fallback provider');
      }
    }
  }

  async analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    try {
      if (this.currentProvider === 'anthropic') {
        const result = await this.anthropicProvider.analyze(request);
        
        // Se Anthropic falhar, fazer fallback automaticamente
        if (!result || result.confidence === undefined) {
          logger.warn('Anthropic provider failed, switching to fallback');
          return await this.fallbackProvider.analyze(request);
        }
        
        return result;
      } else {
        return await this.fallbackProvider.analyze(request);
      }
    } catch (error) {
      logger.error('Provider router error:', error);
      return await this.fallbackProvider.analyze(request);
    }
  }

  getStatus(): { ok: boolean; provider: string } {
    if (this.currentProvider === 'anthropic') {
      return this.anthropicProvider.getStatus();
    } else {
      return this.fallbackProvider.getStatus();
    }
  }

  switchToFallback(): void {
    this.currentProvider = 'fallback';
    logger.info('Switched to fallback provider');
  }

  getCurrentProvider(): string {
    return this.currentProvider;
  }
}
