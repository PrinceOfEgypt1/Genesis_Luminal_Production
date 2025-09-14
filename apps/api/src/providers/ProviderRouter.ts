/**
 * Provider Router - TRILHO B Ação 6
 * Router com métodos necessários implementados
 */

import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../types/shared';
import type { AIProvider } from './AIProvider';
import { AnthropicProvider } from './AnthropicProvider';
import { FallbackProvider } from './FallbackProvider';
import { logger } from '../utils/logger';

export class ProviderRouter {
  private primaryProvider: AIProvider;
  private fallbackProvider: AIProvider;
  private currentProvider: AIProvider;

  constructor(claudeApiKey: string) {
    this.primaryProvider = new AnthropicProvider(claudeApiKey);
    this.fallbackProvider = new FallbackProvider();
    this.currentProvider = this.primaryProvider;
  }

  async analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    try {
      return await this.currentProvider.analyze(request);
    } catch (error) {
      logger.warn('Primary provider failed, switching to fallback:', error);
      return await this.switchToFallback().analyze(request);
    }
  }

  // ✅ MÉTODOS NECESSÁRIOS IMPLEMENTADOS
  getCurrentProvider(): AIProvider {
    return this.currentProvider;
  }

  switchToFallback(): AIProvider {
    logger.info('Switching to fallback provider');
    this.currentProvider = this.fallbackProvider;
    return this.currentProvider;
  }

  async isHealthy(): Promise<boolean> {
    try {
      return await this.currentProvider.isAvailable();
    } catch {
      return false;
    }
  }

  getProviderName(): string {
    return this.currentProvider.getProviderName();
  }
}
