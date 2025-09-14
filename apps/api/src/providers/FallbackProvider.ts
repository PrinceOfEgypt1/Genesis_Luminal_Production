/**
 * TRILHO B AÇÃO 4 - FallbackProvider refatorado com Strategy Pattern
 * 
 * Provider de fallback que sempre responde com valores seguros,
 * garantindo que o sistema nunca falhe completamente.
 */

import { BaseAIProvider } from './AIProvider';
import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../packages/shared/types/api';
import type { CircuitBreakerConfig } from './ProviderTypes';
import { logger } from '../utils/logger';

/**
 * Provider de fallback que nunca falha
 * 
 * Usado quando outros providers estão indisponíveis.
 * Fornece respostas seguras baseadas em heurísticas simples.
 */
export class FallbackProvider extends BaseAIProvider {
  readonly name = 'fallback';
  readonly version = '1.1.0';

  constructor(circuitBreakerConfig?: Partial<CircuitBreakerConfig>) {
    // Fallback provider usa configuração mais permissiva
    super({
      failureThreshold: 10, // Muito difícil de falhar
      cooldownMs: 5000,     // Recuperação rápida
      retryBaseMs: 100,
      retryMaxMs: 1000,
      ...circuitBreakerConfig
    });

    logger.info('FallbackProvider initialized', {
      name: this.name,
      version: this.version,
      purpose: 'Always available fallback for emotional analysis'
    });
  }

  /**
   * Implementação que nunca falha
   * Usa heurísticas simples para análise emocional
   */
  protected async performAnalysis(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    const text = this.extractText(request);
    const analysis = this.analyzeTextHeuristics(text);
    
    const response: EmotionalAnalysisResponse = {
      intensity: analysis.intensity,
      timestamp: new Date().toISOString(),
      confidence: analysis.confidence,
      recommendation: analysis.recommendation,
      emotionalShift: analysis.emotionalShift,
      morphogenicSuggestion: analysis.morphogenicSuggestion
    };

    logger.debug('Fallback analysis completed', {
      textLength: text.length,
      intensity: response.intensity,
      confidence: response.confidence,
      usedHeuristics: analysis.heuristicsUsed
    });

    return response;
  }

  /**
   * Extrai texto da requisição
   */
  private extractText(request: EmotionalAnalysisRequest): string {
    const input = request as any;
    const text = input?.text ?? input?.message ?? input?.prompt ?? '';
    return (typeof text === 'string' ? text : String(text ?? '')).trim();
  }

  /**
   * Análise heurística simples baseada em padrões de texto
   */
  private analyzeTextHeuristics(text: string): {
    intensity: number;
    confidence: number;
    recommendation: 'continue' | 'pause' | 'adapt';
    emotionalShift: 'positive' | 'negative' | 'stable';
    morphogenicSuggestion: 'spiral' | 'wave' | 'fibonacci' | 'organic' | 'geometric';
    heuristicsUsed: string[];
  } {
    const heuristicsUsed: string[] = [];
    
    // Análise de comprimento
    const textLength = text.length;
    let intensity = 0.5;
    
    if (textLength === 0) {
      heuristicsUsed.push('empty_text');
      return {
        intensity: 0.3,
        confidence: 0.8,
        recommendation: 'continue',
        emotionalShift: 'stable',
        morphogenicSuggestion: 'organic',
        heuristicsUsed
      };
    }

    // Heurística baseada em comprimento
    if (textLength > 200) {
      intensity += 0.2;
      heuristicsUsed.push('long_text');
    } else if (textLength < 20) {
      intensity -= 0.1;
      heuristicsUsed.push('short_text');
    }

    // Heurística baseada em pontuação
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;
    
    if (exclamationCount > 0) {
      intensity += exclamationCount * 0.1;
      heuristicsUsed.push('exclamation_marks');
    }
    
    if (questionCount > 0) {
      intensity += questionCount * 0.05;
      heuristicsUsed.push('question_marks');
    }

    // Heurística baseada em palavras-chave emotivas
    const positiveWords = ['feliz', 'alegre', 'amor', 'ótimo', 'excelente', 'maravilhoso', 'happy', 'love', 'great', 'excellent'];
    const negativeWords = ['triste', 'raiva', 'ódio', 'terrível', 'ruim', 'péssimo', 'sad', 'angry', 'hate', 'terrible', 'bad'];
    
    const lowerText = text.toLowerCase();
    let emotionalShift: 'positive' | 'negative' | 'stable' = 'stable';
    
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      emotionalShift = 'positive';
      intensity += 0.15;
      heuristicsUsed.push('positive_keywords');
    } else if (negativeCount > positiveCount) {
      emotionalShift = 'negative';
      intensity += 0.1;
      heuristicsUsed.push('negative_keywords');
    }

    // Normalizar intensidade
    intensity = Math.max(0, Math.min(1, intensity));

    // Determinar recomendação baseada na intensidade
    let recommendation: 'continue' | 'pause' | 'adapt';
    if (intensity > 0.8) {
      recommendation = 'pause';
      heuristicsUsed.push('high_intensity_pause');
    } else if (intensity < 0.3) {
      recommendation = 'adapt';
      heuristicsUsed.push('low_intensity_adapt');
    } else {
      recommendation = 'continue';
      heuristicsUsed.push('moderate_intensity_continue');
    }

    // Sugestão morfogênica baseada no padrão do texto
    let morphogenicSuggestion: 'spiral' | 'wave' | 'fibonacci' | 'organic' | 'geometric';
    
    if (text.includes('números') || text.includes('matemática') || /\d+/.test(text)) {
      morphogenicSuggestion = 'fibonacci';
      heuristicsUsed.push('mathematical_content');
    } else if (exclamationCount > 2 || intensity > 0.7) {
      morphogenicSuggestion = 'spiral';
      heuristicsUsed.push('high_energy');
    } else if (questionCount > 1) {
      morphogenicSuggestion = 'wave';
      heuristicsUsed.push('questioning_pattern');
    } else if (textLength > 100) {
      morphogenicSuggestion = 'geometric';
      heuristicsUsed.push('structured_content');
    } else {
      morphogenicSuggestion = 'organic';
      heuristicsUsed.push('natural_content');
    }

    // Confiança baseada na quantidade de heurísticas aplicadas
    const confidence = Math.min(0.8, 0.4 + (heuristicsUsed.length * 0.1));

    return {
      intensity,
      confidence,
      recommendation,
      emotionalShift,
      morphogenicSuggestion,
      heuristicsUsed
    };
  }

  /**
   * Override do método isHealthy - fallback está sempre saudável
   */
  isHealthy(): boolean {
    return true;
  }

  /**
   * Metadata específica do fallback provider
   */
  protected getProviderMetadata(): Record<string, any> {
    return {
      alwaysAvailable: true,
      usesHeuristics: true,
      heuristicTypes: [
        'text_length_analysis',
        'punctuation_analysis', 
        'keyword_sentiment',
        'pattern_recognition'
      ],
      reliability: 'guaranteed'
    };
  }
}
