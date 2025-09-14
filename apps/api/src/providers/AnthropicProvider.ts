/**
 * TRILHO B AÇÃO 4 - AnthropicProvider refatorado com Strategy Pattern
 * 
 * Provider específico para Anthropic Claude API, implementando BaseAIProvider
 * com circuit breaker integrado e logging estruturado.
 */

import { BaseAIProvider } from './AIProvider';
import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../packages/shared/types/api';
import type { CircuitBreakerConfig } from './ProviderTypes';
import { env, apiKey } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Provider para Anthropic Claude API
 * 
 * Implementa análise emocional usando Claude com circuit breaker
 * e retry logic automático.
 */
export class AnthropicProvider extends BaseAIProvider {
  readonly name = 'anthropic';
  readonly version = '1.2.0';

  private readonly baseUrl = 'https://api.anthropic.com/v1/messages';
  private readonly model = 'claude-3-5-sonnet-latest';
  private readonly anthropicVersion = '2023-06-01';

  constructor(circuitBreakerConfig?: Partial<CircuitBreakerConfig>) {
    super(circuitBreakerConfig);
    
    logger.info('AnthropicProvider initialized', {
      name: this.name,
      version: this.version,
      model: this.model,
      circuitBreakerConfig: this.circuitBreakerConfig
    });
  }

  /**
   * Implementação específica da análise emocional via Claude
   */
  protected async performAnalysis(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    const apiKeyValue = apiKey();
    if (!apiKeyValue) {
      const error = new Error('MISSING_API_KEY: Claude API key not configured');
      (error as any).code = 'MISSING_API_KEY';
      throw error;
    }

    const text = this.extractText(request);
    if (!text) {
      logger.warn('Empty text in request, returning default response');
      return this.createDefaultResponse();
    }

    const requestBody = {
      model: this.model,
      max_tokens: 256,
      messages: [{ 
        role: 'user' as const, 
        content: this.buildPrompt(text, request) 
      }]
    };

    logger.debug('Making request to Claude API', {
      model: this.model,
      textLength: text.length,
      requestId: this.generateRequestId()
    });

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKeyValue,
        'anthropic-version': this.anthropicVersion,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      await this.handleApiError(response);
    }

    const data = await response.json();
    return this.mapClaudeResponse(data, text);
  }

  /**
   * Extrai texto da requisição de forma segura
   */
  private extractText(request: EmotionalAnalysisRequest): string {
    const input = request as any;
    const text = input?.text ?? input?.message ?? input?.prompt ?? '';
    return (typeof text === 'string' ? text : String(text ?? '')).trim();
  }

  /**
   * Constrói prompt contextual para Claude
   */
  private buildPrompt(text: string, request: EmotionalAnalysisRequest): string {
    const context = this.extractContext(request);
    
    return `Analise o estado emocional do seguinte texto e responda em formato JSON:

Texto: "${text}"

${context ? `Contexto adicional: ${context}` : ''}

Responda com um JSON contendo:
- intensity: número entre 0-1 indicando intensidade emocional
- confidence: número entre 0-1 indicando confiança da análise
- recommendation: "continue", "pause", ou "adapt"
- emotionalShift: "positive", "negative", ou "stable"
- morphogenicSuggestion: "spiral", "wave", "fibonacci", "organic", ou "geometric"

Mantenha a resposta factual e baseada apenas no texto fornecido.`;
  }

  /**
   * Extrai contexto adicional da requisição
   */
  private extractContext(request: EmotionalAnalysisRequest): string {
    const parts: string[] = [];
    
    if ('currentState' in request && request.currentState) {
      parts.push(`Estado atual: intensidade ${request.currentState.intensity}`);
    }
    
    if ('mousePosition' in request && request.mousePosition) {
      parts.push(`Posição do mouse: ${request.mousePosition.x}, ${request.mousePosition.y}`);
    }
    
    return parts.join('. ');
  }

  /**
   * Mapeia resposta do Claude para formato esperado
   */
  private mapClaudeResponse(data: any, originalText: string): EmotionalAnalysisResponse {
    try {
      // Extrair texto da resposta Claude
      const content = data?.content?.[0]?.text || '';
      
      // Tentar parsear JSON da resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validar e sanitizar campos
        const response: EmotionalAnalysisResponse = {
          intensity: this.clamp(parsed.intensity ?? 0.5, 0, 1),
          timestamp: new Date().toISOString(),
          confidence: this.clamp(parsed.confidence ?? 0.7, 0, 1),
          recommendation: this.validateRecommendation(parsed.recommendation),
          emotionalShift: this.validateEmotionalShift(parsed.emotionalShift),
          morphogenicSuggestion: this.validateMorphogenicSuggestion(parsed.morphogenicSuggestion)
        };

        logger.info('Claude analysis completed successfully', {
          textLength: originalText.length,
          intensity: response.intensity,
          confidence: response.confidence,
          recommendation: response.recommendation
        });

        return response;
      }
    } catch (error) {
      logger.warn('Failed to parse Claude response, using default', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }

    // Fallback para resposta padrão se parsing falhar
    return this.createDefaultResponse();
  }

  /**
   * Cria resposta padrão quando Claude falha
   */
  private createDefaultResponse(): EmotionalAnalysisResponse {
    return {
      intensity: 0.5,
      timestamp: new Date().toISOString(),
      confidence: 0.3, // Baixa confiança para resposta padrão
      recommendation: 'continue',
      emotionalShift: 'stable',
      morphogenicSuggestion: 'organic'
    };
  }

  /**
   * Valida e sanitiza campo recommendation
   */
  private validateRecommendation(value: any): 'continue' | 'pause' | 'adapt' {
    if (typeof value === 'string' && ['continue', 'pause', 'adapt'].includes(value)) {
      return value as 'continue' | 'pause' | 'adapt';
    }
    return 'continue';
  }

  /**
   * Valida e sanitiza campo emotionalShift
   */
  private validateEmotionalShift(value: any): 'positive' | 'negative' | 'stable' {
    if (typeof value === 'string' && ['positive', 'negative', 'stable'].includes(value)) {
      return value as 'positive' | 'negative' | 'stable';
    }
    return 'stable';
  }

  /**
   * Valida e sanitiza campo morphogenicSuggestion
   */
  private validateMorphogenicSuggestion(value: any): 'spiral' | 'wave' | 'fibonacci' | 'organic' | 'geometric' {
    const validValues = ['spiral', 'wave', 'fibonacci', 'organic', 'geometric'];
    if (typeof value === 'string' && validValues.includes(value)) {
      return value as any;
    }
    return 'organic';
  }

  /**
   * Garante que valor está dentro dos limites
   */
  private clamp(value: number, min: number, max: number): number {
    if (typeof value !== 'number' || !isFinite(value)) {
      return min;
    }
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Gera ID único para request (útil para logging)
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Trata erros da API do Claude
   */
  private async handleApiError(response: Response): Promise<never> {
    let errorData: any = {};
    
    try {
      errorData = await response.json();
    } catch {
      // Se não conseguir parsear JSON, usar dados básicos
    }

    const error = new Error(`Claude API Error: ${response.status} ${response.statusText}`);
    (error as any).code = errorData?.error?.type || `HTTP_${response.status}`;
    (error as any).details = errorData;

    logger.error('Claude API request failed', {
      status: response.status,
      statusText: response.statusText,
      errorType: errorData?.error?.type,
      errorMessage: errorData?.error?.message
    });

    throw error;
  }

  /**
   * Retorna metadata específica do Anthropic provider
   */
  protected getProviderMetadata(): Record<string, any> {
    return {
      model: this.model,
      baseUrl: this.baseUrl,
      anthropicVersion: this.anthropicVersion,
      hasApiKey: !!apiKey(),
      isOfflineMode: env.CLAUDE_OFFLINE_MODE === 'true'
    };
  }
}
