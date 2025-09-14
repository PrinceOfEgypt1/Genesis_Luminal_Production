import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse, EmotionalDNA } from '../../../../packages/shared/types/api';
import { AIProvider, extractTextFromRequest } from './AIProvider';
import { logger } from '../utils/logger';

export class FallbackProvider implements AIProvider {
  async analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    logger.info('Using fallback emotional analysis');

    try {
      // ✅ CORREÇÃO: Usar função segura de extração de texto
      const text = extractTextFromRequest(request);
      
      // Análise simples baseada em palavras-chave
      const analysis = this.analyzeTextSimple(text);
      
      return {
        intensity: analysis.intensity,
        dominantAffect: analysis.dominantAffect,
        timestamp: new Date().toISOString(),
        confidence: 0.4, // Baixa confiança para fallback
        recommendation: 'exploring_curiosity',
        emotionalShift: 'stable',
        morphogenicSuggestion: 'fibonacci'
      };
    } catch (error) {
      logger.error('Fallback analysis error:', error);
      
      return {
        intensity: 0.5,
        dominantAffect: 'curiosity',
        timestamp: new Date().toISOString(),
        confidence: 0.1,
        recommendation: 'system_fallback',
        emotionalShift: 'stable',
        morphogenicSuggestion: 'fibonacci'
      };
    }
  }

  private analyzeTextSimple(text: string): { intensity: number; dominantAffect: keyof EmotionalDNA } {
    if (!text) {
      return { intensity: 0.5, dominantAffect: 'curiosity' };
    }

    const textLower = text.toLowerCase();
    
    // Palavras-chave para cada emoção
    const emotionKeywords = {
      joy: ['happy', 'alegria', 'feliz', 'good', 'great', 'amazing', 'wonderful'],
      nostalgia: ['memory', 'past', 'remember', 'old', 'nostalgic', 'memória', 'passado'],
      curiosity: ['what', 'how', 'why', 'curious', 'wonder', 'explore', 'curioso'],
      serenity: ['calm', 'peace', 'tranquil', 'serene', 'relaxed', 'calmo', 'paz'],
      ecstasy: ['ecstatic', 'amazing', 'incredible', 'fantastic', 'awesome', 'incrível'],
      mystery: ['mystery', 'unknown', 'secret', 'hidden', 'mysterious', 'mistério'],
      power: ['strong', 'power', 'confident', 'force', 'powerful', 'forte', 'poder']
    };

    let maxScore = 0;
    let dominantAffect: keyof EmotionalDNA = 'curiosity';

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (textLower.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        dominantAffect = emotion as keyof EmotionalDNA; // ✅ Type assertion segura
      }
    }

    const intensity = Math.min(0.3 + (maxScore * 0.2), 1.0);
    
    return { intensity, dominantAffect };
  }

  getStatus(): { ok: boolean; provider: string } {
    return {
      ok: true,
      provider: 'fallback'
    };
  }
}
