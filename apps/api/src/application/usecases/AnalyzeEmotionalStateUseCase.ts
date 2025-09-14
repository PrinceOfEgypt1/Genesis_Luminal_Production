/**
 * Use Case para análise de estado emocional
 * Implementa regras de negócio e orquestra dependências
 */

import { IEmotionalAnalyzer, ICacheService, ILogger } from '../../domain/interfaces/IEmotionalAnalyzer';
import { EmotionalAnalysisEntity } from '../../domain/entities/EmotionalAnalysisEntity';
import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../../packages/shared/types/api';

export class AnalyzeEmotionalStateUseCase {
  constructor(
    private readonly analyzer: IEmotionalAnalyzer,
    private readonly cache: ICacheService,
    private readonly logger: ILogger
  ) {}

  async execute(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    try {
      // 1. Validações de domínio
      this.validateRequest(request);
      
      // 2. Verificar cache (se aplicável)
      const cacheKey = this.generateCacheKey(request);
      const cachedResult = await this.cache.get(cacheKey);
      
      if (cachedResult) {
        this.logger.debug('Cache hit for emotional analysis', { cacheKey });
        return cachedResult;
      }

      // 3. Delegar análise para provider
      const analysis = await this.analyzer.analyze(request);
      
      // 4. Criar entidade de domínio para validações
      if (analysis.intensity !== undefined && 'currentState' in request) {
        const entity = EmotionalAnalysisEntity.create(
          request.currentState,
          analysis.confidence || 0.5,
          request.userId,
          'api_analysis'
        );
        
        // 5. Enriquecer resposta com dados da entidade
        analysis.dominantAffect = entity.getDominantEmotion();
        analysis.intensity = entity.getTotalIntensity();
      }

      // 6. Cache do resultado (TTL 5 minutos)
      await this.cache.set(cacheKey, analysis, 300);
      
      // 7. Log da operação
      this.logger.info('Emotional analysis completed', {
        confidence: analysis.confidence,
        dominantAffect: analysis.dominantAffect,
        hasCache: false
      });

      return analysis;
      
    } catch (error) {
      this.logger.error('Error in emotional analysis use case', { error, request });
      
      // Fallback graceful
      return {
        intensity: 0.5,
        dominantAffect: 'curiosity',
        timestamp: new Date().toISOString(),
        confidence: 0.1,
        recommendation: 'system_error_fallback',
        emotionalShift: 'stable',
        morphogenicSuggestion: 'fibonacci'
      };
    }
  }

  private validateRequest(request: EmotionalAnalysisRequest): void {
    if (!request) {
      throw new Error('Request cannot be null or undefined');
    }

    // Verificar se tem currentState OU text/message
    const hasEmotionalState = 'currentState' in request && request.currentState;
    const hasTextInput = ('text' in (request as any) && (request as any).text) ||
                        ('message' in (request as any) && (request as any).message) ||
                        ('prompt' in (request as any) && (request as any).prompt);

    if (!hasEmotionalState && !hasTextInput) {
      throw new Error('Request must contain either currentState or text input');
    }

    // Validar mousePosition se presente
    if ('mousePosition' in request && request.mousePosition) {
      const { x, y } = request.mousePosition;
      if (typeof x !== 'number' || typeof y !== 'number') {
        throw new Error('mousePosition must have numeric x and y coordinates');
      }
    }

    // Validar sessionDuration se presente
    if ('sessionDuration' in request && request.sessionDuration !== undefined) {
      if (typeof request.sessionDuration !== 'number' || request.sessionDuration < 0) {
        throw new Error('sessionDuration must be a non-negative number');
      }
    }
  }

  private generateCacheKey(request: EmotionalAnalysisRequest): string {
    // Gerar chave de cache baseada no conteúdo da requisição
    const textInput = (request as any).text || (request as any).message || '';
    const stateInput = 'currentState' in request ? JSON.stringify(request.currentState) : '';
    
    // Hash simples para criar chave única
    const content = textInput + stateInput;
    return `emotional_analysis_${this.simpleHash(content)}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}
