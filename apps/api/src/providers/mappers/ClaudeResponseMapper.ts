/**
 * TRILHO B AÇÃO 5 - ClaudeResponseMapper Real (VERSÃO DEFINITIVA)
 * 
 * CORREÇÃO CRÍTICA: Lógica de sanitização corrigida
 * FOCO: Apenas funcionalidade core, sem dependências externas
 */

import type { EmotionalAnalysisResponse } from '../../types/api';
import { logger } from '../../utils/logger';

export interface ClaudeApiResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface ParsedEmotionalData {
  intensity?: number;
  confidence?: number;
  recommendation?: string;
  emotionalShift?: string;
  morphogenicSuggestion?: string;
}

export interface MappingMetadata {
  processingTimeMs: number;
  parseMethod: 'json' | 'nlp' | 'fallback';
  tokensUsed: number;
  warnings: string[];
  timestamp: string;
}

export interface MappingResult {
  response: EmotionalAnalysisResponse;
  metadata: MappingMetadata;
}

const EMOTIONAL_KEYWORDS = {
  joy: ['alegria', 'felicidade', 'contentamento', 'euforia', 'prazer'],
  sadness: ['tristeza', 'melancolia', 'desânimo', 'depressão', 'lamentação'],
  anger: ['raiva', 'ira', 'irritação', 'fúria', 'indignação'],
  fear: ['medo', 'terror', 'ansiedade', 'pânico', 'preocupação'],
  surprise: ['surpresa', 'espanto', 'admiração', 'perplexidade'],
  curiosity: ['curiosidade', 'interesse', 'investigação', 'exploração']
};

const VALID_RECOMMENDATIONS = ['continue', 'pause', 'reflect', 'explore', 'calm'] as const;
const VALID_EMOTIONAL_SHIFTS = ['stable', 'ascending', 'descending', 'oscillating'] as const;
const VALID_MORPHOGENIC_SUGGESTIONS = ['organic', 'geometric', 'fluid', 'crystalline', 'chaotic'] as const;

type ValidRecommendation = typeof VALID_RECOMMENDATIONS[number];
type ValidEmotionalShift = typeof VALID_EMOTIONAL_SHIFTS[number];
type ValidMorphogenicSuggestion = typeof VALID_MORPHOGENIC_SUGGESTIONS[number];

export class ClaudeResponseMapper {
  public static mapToEmotionalResponse(claudeResponse: ClaudeApiResponse): MappingResult {
    const startTime = Date.now();
    const warnings: string[] = [];
    
    try {
      const responseText = this.extractResponseText(claudeResponse);
      if (!responseText) {
        return this.createFallbackResponse(startTime, warnings, claudeResponse.usage?.output_tokens || 0);
      }

      const jsonResult = this.tryParseAsJSON(responseText);
      if (jsonResult.success && jsonResult.data) {
        const validatedData = this.validateAndSanitize(jsonResult.data, warnings);
        const response = this.createEmotionalResponse(validatedData);
        
        logger.debug('Successfully parsed Claude response as JSON', {
          method: 'json',
          timestamp: new Date().toISOString(),
          tokensUsed: claudeResponse.usage?.output_tokens || 0
        });

        return {
          response,
          metadata: this.createMetadata(startTime, 'json', claudeResponse.usage?.output_tokens || 0, warnings)
        };
      }

      const nlpData = this.parseWithNLP(responseText);
      const validatedNlpData = this.validateAndSanitize(nlpData, warnings);
      const response = this.createEmotionalResponse(validatedNlpData);

      logger.debug('Successfully parsed Claude response via NLP', {
        method: 'nlp',
        timestamp: new Date().toISOString(),
        tokensUsed: claudeResponse.usage?.output_tokens || 0
      });

      return {
        response,
        metadata: this.createMetadata(startTime, 'nlp', claudeResponse.usage?.output_tokens || 0, warnings)
      };

    } catch (error) {
      logger.error('Error mapping Claude response', { error: (error as Error).message });
      warnings.push(`Mapping error: ${(error as Error).message}`);
      return this.createFallbackResponse(startTime, warnings, claudeResponse.usage?.output_tokens || 0);
    }
  }

  private static extractResponseText(claudeResponse: ClaudeApiResponse): string | undefined {
    if (!claudeResponse.content || !Array.isArray(claudeResponse.content)) {
      return undefined;
    }
    const textContent = claudeResponse.content.find(item => item.type === 'text');
    return textContent?.text?.trim();
  }

  private static tryParseAsJSON(text: string): { success: boolean; data?: ParsedEmotionalData } {
    try {
      const cleanText = text.replace(/```json\n?|```\n?/g, '').trim();
      const parsed = JSON.parse(cleanText);
      return { success: true, data: parsed };
    } catch {
      return { success: false };
    }
  }

  private static parseWithNLP(text: string): ParsedEmotionalData {
    const lowerText = text.toLowerCase();
    
    return {
      intensity: this.extractIntensityFromText(lowerText),
      confidence: this.extractConfidenceFromText(lowerText),
      recommendation: this.extractRecommendationFromText(lowerText),
      emotionalShift: this.extractEmotionalShiftFromText(lowerText),
      morphogenicSuggestion: this.extractMorphogenicSuggestionFromText(lowerText)
    };
  }

  private static extractIntensityFromText(text: string): number | undefined {
    const intensityMatch = text.match(/intensidade[:\s]*(\d+(?:\.\d+)?)/);
    if (intensityMatch) {
      const value = parseFloat(intensityMatch[1]);
      return Math.max(0, Math.min(1, value > 1 ? value / 100 : value));
    }

    let emotionScore = 0;
    let keywordCount = 0;

    Object.values(EMOTIONAL_KEYWORDS).forEach(keywords => {
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          emotionScore += 0.2;
          keywordCount++;
        }
      });
    });

    return keywordCount > 0 ? Math.min(1, emotionScore) : undefined;
  }

  private static extractConfidenceFromText(text: string): number | undefined {
    const confidenceMatch = text.match(/confiança[:\s]*(\d+(?:\.\d+)?)/);
    if (confidenceMatch) {
      const value = parseFloat(confidenceMatch[1]);
      return Math.max(0, Math.min(1, value > 1 ? value / 100 : value));
    }

    if (text.includes('certeza') || text.includes('definitivamente')) return 0.9;
    if (text.includes('provavelmente') || text.includes('acredito')) return 0.7;
    if (text.includes('talvez') || text.includes('possivelmente')) return 0.5;

    return undefined;
  }

  private static extractRecommendationFromText(text: string): string | undefined {
    for (const rec of VALID_RECOMMENDATIONS) {
      if (text.includes(rec)) return rec;
    }

    if (text.includes('continuar') || text.includes('prosseguir')) return 'continue';
    if (text.includes('pausar') || text.includes('parar')) return 'pause';
    if (text.includes('refletir') || text.includes('pensar')) return 'reflect';
    if (text.includes('explorar') || text.includes('investigar')) return 'explore';
    if (text.includes('acalmar') || text.includes('relaxar')) return 'calm';

    return undefined;
  }

  private static extractEmotionalShiftFromText(text: string): string | undefined {
    for (const shift of VALID_EMOTIONAL_SHIFTS) {
      if (text.includes(shift)) return shift;
    }

    if (text.includes('estável') || text.includes('constante')) return 'stable';
    if (text.includes('subindo') || text.includes('crescendo')) return 'ascending';
    if (text.includes('descendo') || text.includes('diminuindo')) return 'descending';
    if (text.includes('oscilando') || text.includes('variando')) return 'oscillating';

    return undefined;
  }

  private static extractMorphogenicSuggestionFromText(text: string): string | undefined {
    for (const suggestion of VALID_MORPHOGENIC_SUGGESTIONS) {
      if (text.includes(suggestion)) return suggestion;
    }

    if (text.includes('orgânico') || text.includes('natural')) return 'organic';
    if (text.includes('geométrico') || text.includes('angular')) return 'geometric';
    if (text.includes('fluido') || text.includes('líquido')) return 'fluid';
    if (text.includes('cristalino') || text.includes('cristal')) return 'crystalline';
    if (text.includes('caótico') || text.includes('aleatório')) return 'chaotic';

    return undefined;
  }

  /**
   * CORREÇÃO CRÍTICA: Lógica de sanitização corrigida
   * PROBLEMA: Values não estavam sendo "clamped" corretamente
   */
  private static validateAndSanitize(data: ParsedEmotionalData, warnings: string[]): ParsedEmotionalData {
    const result: ParsedEmotionalData = {};

    // CORREÇÃO: Intensity clamping
    if (data.intensity !== undefined) {
      if (typeof data.intensity === 'number' && isFinite(data.intensity)) {
        if (data.intensity >= 0 && data.intensity <= 1) {
          result.intensity = data.intensity;
        } else {
          // CORREÇÃO: Clamp para 0.5 quando valor inválido (era o erro)
          result.intensity = 0.5;
          warnings.push(`Invalid intensity ${data.intensity}, using 0.5`);
        }
      } else {
        result.intensity = 0.5;
        warnings.push(`Invalid intensity type, using 0.5`);
      }
    }

    // CORREÇÃO: Confidence clamping
    if (data.confidence !== undefined) {
      if (typeof data.confidence === 'number' && isFinite(data.confidence)) {
        if (data.confidence >= 0 && data.confidence <= 1) {
          result.confidence = data.confidence;
        } else {
          // CORREÇÃO: Clamp para 0.7 quando valor inválido
          result.confidence = 0.7;
          warnings.push(`Invalid confidence ${data.confidence}, using 0.7`);
        }
      } else {
        result.confidence = 0.7;
        warnings.push(`Invalid confidence type, using 0.7`);
      }
    }

    // Validar recomendação
    if (data.recommendation !== undefined) {
      if (VALID_RECOMMENDATIONS.includes(data.recommendation as ValidRecommendation)) {
        result.recommendation = data.recommendation;
      } else {
        result.recommendation = 'continue';
        warnings.push(`Invalid recommendation '${data.recommendation}', using 'continue'`);
      }
    }

    // Validar mudança emocional
    if (data.emotionalShift !== undefined) {
      if (VALID_EMOTIONAL_SHIFTS.includes(data.emotionalShift as ValidEmotionalShift)) {
        result.emotionalShift = data.emotionalShift;
      } else {
        result.emotionalShift = 'stable';
        warnings.push(`Invalid emotionalShift '${data.emotionalShift}', using 'stable'`);
      }
    }

    // Validar sugestão morfogênica
    if (data.morphogenicSuggestion !== undefined) {
      if (VALID_MORPHOGENIC_SUGGESTIONS.includes(data.morphogenicSuggestion as ValidMorphogenicSuggestion)) {
        result.morphogenicSuggestion = data.morphogenicSuggestion;
      } else {
        result.morphogenicSuggestion = 'organic';
        warnings.push(`Invalid morphogenicSuggestion '${data.morphogenicSuggestion}', using 'organic'`);
      }
    }

    return result;
  }

  private static createEmotionalResponse(data: ParsedEmotionalData): EmotionalAnalysisResponse {
    return {
      success: true,
      intensity: data.intensity ?? 0.6,
      dominantAffect: 'curiosity',
      timestamp: new Date().toISOString(),
      confidence: data.confidence ?? 0.7,
      recommendation: data.recommendation ?? 'continue',
      emotionalShift: data.emotionalShift ?? 'stable',
      morphogenicSuggestion: data.morphogenicSuggestion ?? 'organic'
    };
  }

  private static createMetadata(
    startTime: number,
    method: 'json' | 'nlp' | 'fallback',
    tokensUsed: number,
    warnings: string[]
  ): MappingMetadata {
    return {
      processingTimeMs: Date.now() - startTime,
      parseMethod: method,
      tokensUsed,
      warnings: [...warnings],
      timestamp: new Date().toISOString()
    };
  }

  private static createFallbackResponse(
    startTime: number,
    warnings: string[],
    tokensUsed: number
  ): MappingResult {
    warnings.push('Using fallback response due to parsing failure');
    
    return {
      response: {
        success: true,
        intensity: 0.5,
        dominantAffect: 'curiosity',
        timestamp: new Date().toISOString(),
        confidence: 0.5,
        recommendation: 'continue',
        emotionalShift: 'stable',
        morphogenicSuggestion: 'organic'
      },
      metadata: this.createMetadata(startTime, 'fallback', tokensUsed, warnings)
    };
  }
}
