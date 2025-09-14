import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../packages/shared/types/api';
import { AIProvider } from './AIProvider';
import { logger } from '../utils/logger';
import { ClaudeResponseMapper, type ClaudeApiResponse } from './mappers/ClaudeResponseMapper';

export class AnthropicProvider extends AIProvider {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.anthropic.com/v1/messages';

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async analyzeEmotionalState(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    try {
      const claudeResponse = await this.callClaudeAPI(request);
      const mappingResult = ClaudeResponseMapper.mapToEmotionalResponse(claudeResponse);
      
      logger.info('Claude response mapped successfully', {
        confidence: mappingResult.response.confidence,
        intensity: mappingResult.response.intensity,
        parseMethod: mappingResult.metadata.parseMethod,
        processingTimeMs: mappingResult.metadata.processingTimeMs,
        timestamp: mappingResult.metadata.timestamp,
        tokensUsed: mappingResult.metadata.tokensUsed,
        ...(mappingResult.metadata.warnings.length > 0 && { warnings: mappingResult.metadata.warnings })
      });

      return mappingResult.response;
    } catch (error) {
      logger.error('AnthropicProvider error', { error: (error as Error).message });
      throw error;
    }
  }

  private async callClaudeAPI(request: EmotionalAnalysisRequest): Promise<ClaudeApiResponse> {
    const prompt = this.buildPrompt(request);
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private buildPrompt(request: EmotionalAnalysisRequest): string {
    return `Analise o estado emocional baseado nos dados: ${JSON.stringify(request.currentState)}. 
    Retorne no formato JSON com intensity (0-1), confidence (0-1), recommendation (continue|pause|reflect|explore|calm), 
    emotionalShift (stable|ascending|descending|oscillating), morphogenicSuggestion (organic|geometric|fluid|crystalline|chaotic).`;
  }

  getStatus(): { ok: boolean; provider: string } {
    return { ok: true, provider: 'anthropic' };
  }
}
