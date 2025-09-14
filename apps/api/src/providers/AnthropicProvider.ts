import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../packages/shared/types/api';
import { AIProvider, extractTextFromRequest, createFallbackResponse } from './AIProvider';
import { logger } from '../utils/logger';
import { config } from '../config/environment';

export class AnthropicProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly model: string;

  constructor() {
    this.apiKey = config.CLAUDE_API_KEY || '';
    this.apiUrl = config.CLAUDE_API_URL;
    this.model = config.CLAUDE_MODEL;
  }

  async analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    if (!this.apiKey) {
      logger.warn('Claude API key not configured, using fallback');
      return createFallbackResponse();
    }

    try {
      // ✅ CORREÇÃO: Usar função segura de extração de texto
      const text = extractTextFromRequest(request);
      
      if (!text) {
        logger.warn('No text content found in request');
        return createFallbackResponse();
      }

      const response = await this.callAnthropicAPI(text);
      return this.parseResponse(response);
    } catch (error) {
      logger.error('Anthropic API error:', error);
      return createFallbackResponse();
    }
  }

  private async callAnthropicAPI(text: string): Promise<any> {
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Analyze the emotional state from this text and respond with a JSON object containing: intensity (0-1), dominantAffect (one of: joy, nostalgia, curiosity, serenity, ecstasy, mystery, power), confidence (0-1), recommendation (string), emotionalShift (string), morphogenicSuggestion (string). Text: "${text}"`
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    return response.json();
  }

  private parseResponse(apiResponse: any): EmotionalAnalysisResponse {
    try {
      const content = apiResponse.content?.[0]?.text || '{}';
      const parsed = JSON.parse(content);
      
      return {
        intensity: typeof parsed.intensity === 'number' ? parsed.intensity : 0.5,
        dominantAffect: parsed.dominantAffect || 'curiosity',
        timestamp: new Date().toISOString(),
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
        recommendation: parsed.recommendation || 'exploring_curiosity',
        emotionalShift: parsed.emotionalShift || 'stable',
        morphogenicSuggestion: parsed.morphogenicSuggestion || 'fibonacci'
      };
    } catch (error) {
      logger.warn('Failed to parse Anthropic response, using fallback');
      return createFallbackResponse();
    }
  }

  getStatus(): { ok: boolean; provider: string } {
    return {
      ok: !!this.apiKey,
      provider: 'anthropic'
    };
  }
}
