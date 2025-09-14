/**
 * Fallback Provider - TRILHO B Ação 6
 * Provider de fallback com response format correto
 */

import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse, EmotionalDNA } from '../types/shared';
import type { AIProvider } from './AIProvider';
import { extractTextFromRequest } from '../types/shared';
import { logger } from '../utils/logger';

export class FallbackProvider implements AIProvider {
  async analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    try {
      const text = extractTextFromRequest(request);
      logger.info('Using fallback analysis for:', text);

      // Análise básica baseada em palavras-chave
      const intensity = this.calculateIntensity(text);
      const dominantAffect = this.detectDominantAffect(text);

      const response: EmotionalAnalysisResponse = {
        success: true, // ✅ ADICIONADO
        intensity,
        dominantAffect, // ✅ ADICIONADO
        timestamp: new Date().toISOString(),
        confidence: 0.6,
        recommendation: intensity > 0.7 ? 'pause' : 'continue',
        emotionalShift: intensity > 0.5 ? 'positive' : 'stable',
        morphogenicSuggestion: 'fibonacci'
      };

      return response;

    } catch (error) {
      logger.error('Fallback provider error:', error);
      throw error;
    }
  }

  private calculateIntensity(text: string): number {
    // Análise simples por palavras-chave
    const intensityWords = ['amazing', 'incredible', 'fantastic', 'terrible', 'awful'];
    const words = text.toLowerCase().split(' ');
    const matches = words.filter(word => intensityWords.includes(word));
    return Math.min(matches.length * 0.3, 1.0);
  }

  private detectDominantAffect(text: string): string {
    // Detecção básica de emoção dominante
    const emotions = {
      joy: ['happy', 'joyful', 'excited', 'amazing'],
      curiosity: ['interesting', 'wonder', 'explore', 'question'],
      serenity: ['calm', 'peaceful', 'serene', 'tranquil']
    };

    const words = text.toLowerCase().split(' ');
    
    for (const [emotion, keywords] of Object.entries(emotions)) {
      if (keywords.some(keyword => words.includes(keyword))) {
        return emotion;
      }
    }
    
    return 'curiosity'; // default
  }

  async isAvailable(): Promise<boolean> {
    return true; // Fallback sempre disponível
  }

  getProviderName(): string {
    return 'fallback';
  }
}
