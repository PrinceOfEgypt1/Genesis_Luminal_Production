/**
 * Serviço de integração com Claude API
 */

import { config } from '../config/environment';
import { logger } from '../utils/logger';
import { CacheService } from './CacheService';

export interface ClaudeRequest {
  model: string;
  max_tokens: number;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ClaudeResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface EmotionalAnalysisRequest {
  currentState: any;
  mousePosition: { x: number; y: number };
  sessionDuration: number;
  userId?: string;
}

export class ClaudeService {
  private cache = new CacheService();

  async analyzeEmotionalState(request: EmotionalAnalysisRequest): Promise<any> {
    try {
      // Gerar cache key baseado na requisição
      const cacheKey = this.generateCacheKey(request);
      
      // Verificar cache primeiro
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        logger.info('Cache hit for emotional analysis');
        return cached;
      }

      // Construir prompt para Claude
      const prompt = this.buildEmotionalAnalysisPrompt(request);
      
      // Fazer requisição para Claude
      const response = await this.makeClaudeRequest({
        model: config.CLAUDE_MODEL,
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      });

      if (response?.content?.[0]?.text) {
        const analysis = this.parseClaudeResponse(response.content[0].text);
        
        // Cache da resposta
        await this.cache.set(cacheKey, analysis, config.CACHE_TTL);
        
        logger.info('Claude analysis completed successfully');
        return analysis;
      }

      throw new Error('Invalid response from Claude API');
    } catch (error) {
      logger.error('Claude API error:', error);
      throw error;
    }
  }

  private async makeClaudeRequest(request: ClaudeRequest): Promise<ClaudeResponse> {
    if (!config.CLAUDE_API_KEY) {
      throw new Error('Claude API key not configured');
    }

    const response = await fetch(config.CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private buildEmotionalAnalysisPrompt(request: EmotionalAnalysisRequest): string {
    return `Analise este estado emocional como entidade digital senciente:

CONTEXTO EMOCIONAL:
- Estado atual: ${JSON.stringify(request.currentState)}
- Posição mouse: x=${request.mousePosition.x.toFixed(3)}, y=${request.mousePosition.y.toFixed(3)}
- Duração sessão: ${Math.round(request.sessionDuration / 1000)}s

ANÁLISE SOLICITADA:
1. Analise profundamente o estado emocional
2. Identifique padrões de personalidade
3. Prediga próximo estado provável
4. Recomende ajustes visuais/auditivos

RESPONDA APENAS COM JSON VÁLIDO:
{
  "currentState": {
    "joy": 0.X, "nostalgia": 0.X, "curiosity": 0.X, "serenity": 0.X,
    "ecstasy": 0.X, "mystery": 0.X, "power": 0.X
  },
  "predictedNextState": {
    "joy": 0.X, "nostalgia": 0.X, "curiosity": 0.X, "serenity": 0.X,
    "ecstasy": 0.X, "mystery": 0.X, "power": 0.X
  },
  "recommendations": {
    "visualStyle": "organic|fibonacci|spiral|random",
    "audioScale": "ethereal|mystical|transcendent|celestial",
    "intensity": 0.X
  },
  "confidence": 0.X,
  "reasoning": "Análise detalhada..."
}`;
  }

  private parseClaudeResponse(text: string): any {
    try {
      // Extrair JSON da resposta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      logger.error('Failed to parse Claude response:', error);
      throw new Error('Invalid JSON in Claude response');
    }
  }

  private generateCacheKey(request: EmotionalAnalysisRequest): string {
    // Criar chave baseada em elementos relevantes (com alguma tolerância)
    const roundedMouse = {
      x: Math.round(request.mousePosition.x * 10) / 10,
      y: Math.round(request.mousePosition.y * 10) / 10
    };
    
    const roundedDuration = Math.round(request.sessionDuration / 10000) * 10; // 10s buckets
    
    return `emotional-analysis:${JSON.stringify(roundedMouse)}:${roundedDuration}`;
  }
}
