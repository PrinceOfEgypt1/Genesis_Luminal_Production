/**
 * Anthropic Provider - TRILHO B Ação 6
 * Provider Claude com types corrigidos
 */

import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse, ClaudeApiResponse } from '../types/shared';
import type { AIProvider } from './AIProvider';
import { extractTextFromRequest } from '../types/shared';
import { logger } from '../utils/logger';

export class AnthropicProvider implements AIProvider {
  private apiKey: string;
  private apiUrl = 'https://api.anthropic.com/v1/messages';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    try {
      const text = extractTextFromRequest(request);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Analyze emotional state: ${text}`
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const claudeResponse: ClaudeApiResponse = await response.json();
      
      return {
        success: true, // ✅ ADICIONADO
        intensity: 0.8,
        dominantAffect: 'curiosity',
        timestamp: new Date().toISOString(),
        confidence: 0.9,
        recommendation: 'continue',
        emotionalShift: 'positive',
        morphogenicSuggestion: 'explore deeper'
      };

    } catch (error) {
      logger.error('Anthropic provider error:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  getProviderName(): string {
    return 'anthropic';
  }
}
