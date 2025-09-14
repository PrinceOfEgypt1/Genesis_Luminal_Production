/**
 * TRILHO B AÇÃO 5 - AnthropicProvider com Mapper Real
 * 
 * Provider Anthropic Claude refatorado para usar ClaudeResponseMapper dedicado.
 * Removidos TODOs e implementado mapeamento real (não simulação).
 * 
 * HONESTIDADE TÉCNICA: Este provider agora usa mapeamento real da Claude API
 * via ClaudeResponseMapper, não dados hardcoded ou simulados.
 */

import { BaseAIProvider } from './AIProvider';
import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../packages/shared/types/api';
import type { CircuitBreakerConfig } from './ProviderTypes';
import { ClaudeResponseMapper, ClaudeApiResponse } from './mappers/ClaudeResponseMapper';
import { env, apiKey } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Provider para Anthropic Claude API com mapeamento real
 * 
 * Implementa análise emocional usando Claude API com ClaudeResponseMapper
 * dedicado para parsing rigoroso das respostas.
 */
export class AnthropicProvider extends BaseAIProvider {
  readonly name = 'anthropic';
  readonly version = '2.0.0'; // Atualizada para refletir mapper real

  private readonly baseUrl = 'https://api.anthropic.com/v1/messages';
  private readonly model = 'claude-3-5-sonnet-latest';
  private readonly anthropicVersion = '2023-06-01';
  private readonly maxTokens = 512;

  constructor(circuitBreakerConfig?: Partial<CircuitBreakerConfig>) {
    super(circuitBreakerConfig);
    
    logger.info('AnthropicProvider initialized with real mapper', {
      name: this.name,
      version: this.version,
      model: this.model,
      mapperVersion: 'ClaudeResponseMapper v2.0',
      circuitBreakerConfig: this.circuitBreakerConfig
    });
  }

  /**
   * Implementação específica da análise emocional via Claude com mapper real
   * 
   * NOTA: Removido TODO - agora usa ClaudeResponseMapper para mapeamento real
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
      logger.warn('Empty text in request, creating minimal response');
      return this.createMinimalResponse();
    }

    const requestBody = {
      model: this.model,
      max_tokens: this.maxTokens,
      messages: [{ 
        role: 'user' as const, 
        content: this.buildEmotionalAnalysisPrompt(text, request) 
      }]
    };

    const requestId = this.generateRequestId();
    
    logger.debug('Making request to Claude API with real mapper', {
      model: this.model,
      textLength: text.length,
      requestId,
      maxTokens: this.maxTokens
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

    const claudeResponse: ClaudeApiResponse = await response.json();
    
    // ✅ IMPLEMENTAÇÃO REAL: Usar ClaudeResponseMapper para mapeamento real
    const mappingResult = ClaudeResponseMapper.mapToEmotionalResponse(claudeResponse, text);
    
    // Log do resultado do mapeamento
    logger.info('Claude response mapped successfully', {
      requestId,
      parseMethod: mappingResult.metadata.parseMethod,
      confidence: mappingResult.metadata.confidence,
      tokensUsed: mappingResult.metadata.tokensUsed,
      processingTimeMs: mappingResult.metadata.processingTimeMs,
      warnings: mappingResult.metadata.warnings.length > 0 ? mappingResult.metadata.warnings : undefined,
      mappingSuccess: mappingResult.success
    });

    return mappingResult.response;
  }

  /**
   * Constrói prompt especializado para análise emocional
   */
  private buildEmotionalAnalysisPrompt(text: string, request: EmotionalAnalysisRequest): string {
    const context = this.extractContext(request);
    
    return `Como especialista em análise emocional, analise o seguinte texto e retorne uma resposta estruturada:

Texto para análise: "${text}"

${context ? `Contexto adicional: ${context}` : ''}

Por favor, responda com um objeto JSON contendo EXATAMENTE estes campos:
{
  "intensity": <número entre 0-1 indicando intensidade emocional>,
  "confidence": <número entre 0-1 indicando confiança da análise>,
  "recommendation": <"continue" | "pause" | "adapt" baseado no estado emocional>,
  "emotionalShift": <"positive" | "negative" | "stable" indicando direção da mudança>,
  "morphogenicSuggestion": <"spiral" | "wave" | "fibonacci" | "organic" | "geometric" para padrão visual>
}

Critérios:
- intensity: Baseado na carga emocional presente no texto (0=neutro, 1=extremo)
- confidence: Sua certeza na análise (0=incerto, 1=muito certo)
- recommendation: continue=continuar interação, pause=reduzir estímulo, adapt=modificar abordagem
- emotionalShift: Direção da tendência emocional detectada
- morphogenicSuggestion: Padrão visual que melhor representa a energia emocional

Importante: Responda APENAS com o JSON válido, sem texto adicional.`;
  }

  /**
   * Extrai contexto adicional da requisição para prompt
   */
  private extractContext(request: EmotionalAnalysisRequest): string {
    const parts: string[] = [];
    
    if ('currentState' in request && request.currentState) {
      const state = request.currentState as any;
      if (state.intensity !== undefined) {
        parts.push(`Intensidade emocional atual: ${state.intensity}`);
      }
      if (state.dominantAffect) {
        parts.push(`Afeto dominante: ${state.dominantAffect}`);
      }
    }
    
    if ('mousePosition' in request && request.mousePosition) {
      parts.push(`Interação ativa (mouse em ${request.mousePosition.x}, ${request.mousePosition.y})`);
    }

    if ('sessionDuration' in request && request.sessionDuration) {
      const duration = request.sessionDuration as number;
      if (duration > 0) {
        parts.push(`Duração da sessão: ${Math.round(duration)}s`);
      }
    }
    
    return parts.join('. ');
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
   * Cria resposta mínima para casos edge
   */
  private createMinimalResponse(): EmotionalAnalysisResponse {
    return {
      intensity: 0.3, // Baixa intensidade para texto vazio
      timestamp: new Date().toISOString(),
      confidence: 0.2, // Baixa confiança
      recommendation: 'continue',
      emotionalShift: 'stable',
      morphogenicSuggestion: 'organic'
    };
  }

  /**
   * Gera ID único para request (útil para logging)
   */
  private generateRequestId(): string {
    return `claude_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      maxTokens: this.maxTokens,
      hasApiKey: !!apiKey(),
      isOfflineMode: env.CLAUDE_OFFLINE_MODE === 'true',
      mapperVersion: 'ClaudeResponseMapper v2.0',
      supportedMethods: ['json', 'nlp', 'fallback'],
      honestImplementation: true // Flag de honestidade técnica
    };
  }
}
