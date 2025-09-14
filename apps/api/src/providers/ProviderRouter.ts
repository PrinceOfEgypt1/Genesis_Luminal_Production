import { config } from '../config/environment';
import { AnthropicProvider } from './AnthropicProvider';
import { FallbackProvider } from './FallbackProvider';
import type { AIProvider } from './AIProvider';
import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../packages/shared/types/api';
import { logger } from '../utils/logger';

export class ProviderRouter {
  private providers: AIProvider[];
  private currentProvider: AIProvider;

  constructor() {
    this.providers = this.initializeProviders();
    this.currentProvider = this.selectBestProvider();
    
    logger.info('ProviderRouter initialized', {
      providersCount: this.providers.length,
      currentProvider: this.currentProvider.status().provider
    });
  }

  async analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    try {
      return await this.currentProvider.analyze(request);
    } catch (error) {
      logger.warn('Primary provider failed, trying fallback', { error });
      return await this.getFallbackProvider().analyze(request);
    }
  }

  status() {
    return {
      current: this.currentProvider.status(),
      providers: this.providers.map(p => p.status())
    };
  }

  private initializeProviders(): AIProvider[] {
    const providers: AIProvider[] = [];

    // Anthropic Provider
    if (config.CLAUDE_API_KEY && !config.CLAUDE_OFFLINE_MODE) {
      providers.push(new AnthropicProvider(
        config.CLAUDE_API_KEY, 
        config.CLAUDE_MODEL
      ));
    }

    // Always include fallback
    providers.push(new FallbackProvider());

    return providers;
  }

  private selectBestProvider(): AIProvider {
    // Prefer Anthropic if available and configured
    const anthropicProvider = this.providers.find(p => 
      p.status().provider.includes('Anthropic')
    );
    
    if (anthropicProvider && anthropicProvider.status().ok) {
      return anthropicProvider;
    }

    // Fall back to first available provider
    return this.providers[0];
  }

  private getFallbackProvider(): AIProvider {
    return this.providers.find(p => 
      p.status().provider.includes('Fallback')
    ) || this.providers[this.providers.length - 1];
  }
}

// Singleton instance
export const providerRouter = new ProviderRouter();
