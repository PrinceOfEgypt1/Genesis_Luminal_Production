import { AnthropicProvider } from './AnthropicProvider';
import { FallbackProvider } from './FallbackProvider';
import { logger } from '../utils/logger';
import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../shared/types/api';

export class ProviderRouter {
  private providers: Array<{ name: string; provider: any }>;
  private failureCount: number = 0;
  private maxFailures: number = 3;
  private lastFailureTime: number = 0;
  private circuitBreakerTimeout: number = 60000; // 1 minute

  constructor() {
    this.providers = [
      { name: 'anthropic', provider: new AnthropicProvider() },
      { name: 'fallback', provider: new FallbackProvider() }
    ];
  }

  async analyzeEmotion(input: string): Promise<EmotionalAnalysisResponse> {
    const startTime = Date.now();
    
    // Circuit breaker logic
    if (this.isCircuitBreakerOpen()) {
      logger.warn('Circuit breaker is open, using fallback');
      return await this.useFallback(input, startTime);
    }

    try {
      // Try primary provider (Anthropic)
      const result = await this.providers[0].provider.analyze({ text: input });
      
      // Reset failure count on success
      this.failureCount = 0;
      
      return {
        ...result,
        processingTime: Date.now() - startTime,
        provider: this.providers[0].name
      };
    } catch (error) {
      logger.error('Primary provider failed', { error, input });
      
      // Increment failure count
      this.failureCount++;
      this.lastFailureTime = Date.now();
      
      // Use fallback
      return await this.useFallback(input, startTime);
    }
  }

  private async useFallback(input: string, startTime: number): Promise<EmotionalAnalysisResponse> {
    try {
      const result = await this.providers[1].provider.analyze({ text: input });
      return {
        ...result,
        processingTime: Date.now() - startTime,
        provider: this.providers[1].name
      };
    } catch (error) {
      logger.error('Fallback provider also failed', { error });
      throw new Error('All providers failed');
    }
  }

  private isCircuitBreakerOpen(): boolean {
    if (this.failureCount >= this.maxFailures) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      return timeSinceLastFailure < this.circuitBreakerTimeout;
    }
    return false;
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.providers[0].provider.analyze({ text: 'health check' });
      return true;
    } catch {
      return false;
    }
  }

  getActiveProviderName(): string {
    return this.isCircuitBreakerOpen() ? this.providers[1].name : this.providers[0].name;
  }
}

------------------------------------------------------------------------------------------------------------------------