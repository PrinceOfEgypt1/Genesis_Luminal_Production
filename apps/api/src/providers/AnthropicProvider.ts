import fetch from 'node-fetch';
import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../packages/shared/types/api';
import { BaseAIProvider } from './AIProvider';
import { logger } from '../utils/logger';

export class AnthropicProvider extends BaseAIProvider {
  protected name = 'Anthropic Claude';
  
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'claude-3-5-sonnet-20240620') {
    super();
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    this.logRequest(request);

    try {
      const text = this.extractText(request);
      if (!text || text.trim().length === 0) {
        return this.createDefaultResponse();
      }

      const response = await this.callAnthropicAPI(text);
      return this.parseResponse(response);
    } catch (error) {
      logger.error('Anthropic API error:', error);
      return this.createDefaultResponse();
    }
  }

  private extractText(request: EmotionalAnalysisRequest): string {
    if ('text' in request) {
      return request.text;
    }
    return 'analyze current emotional state';
  }

  private async callAnthropicAPI(text: string): Promise<any> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: `Analyze the emotional state of this text and respond with a JSON object with intensity (0-1), dominantAffect (string), confidence (0-1), recommendation (string), emotionalShift (string), and morphogenicSuggestion (string): "${text}"`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    return response.json();
  }

  private parseResponse(response: any): EmotionalAnalysisResponse {
    try {
      const content = response.content?.[0]?.text || '';
      const parsed = JSON.parse(content);
      
      return {
        intensity: parsed.intensity || 0.5,
        dominantAffect: parsed.dominantAffect || 'neutral',
        timestamp: new Date().toISOString(),
        confidence: parsed.confidence || 0.5,
        recommendation: parsed.recommendation || 'continue',
        emotionalShift: parsed.emotionalShift || 'stable',
        morphogenicSuggestion: parsed.morphogenicSuggestion || 'fibonacci'
      };
    } catch {
      return this.createDefaultResponse();
    }
  }

  status(): { ok: boolean; provider: string } {
    return { 
      ok: Boolean(this.apiKey), 
      provider: `${this.name} (${this.model})` 
    };
  }
}
