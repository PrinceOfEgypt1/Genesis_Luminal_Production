import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../packages/shared/types/api';
import { BaseAIProvider } from './AIProvider';
import { logger } from '../utils/logger';

export class FallbackProvider extends BaseAIProvider {
  protected name = 'Fallback Local';

  async analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    this.logRequest(request);
    logger.info('Using fallback provider (no external API)');
    
    const text = this.extractText(request);
    const analysis = this.simulateAnalysis(text);
    
    return {
      ...analysis,
      timestamp: new Date().toISOString()
    };
  }

  private extractText(request: EmotionalAnalysisRequest): string {
    if ('text' in request) {
      return request.text;
    }
    return '';
  }

  private simulateAnalysis(text: string): Omit<EmotionalAnalysisResponse, 'timestamp'> {
    // Análise simples baseada no comprimento e conteúdo do texto
    const textLength = text.length;
    const hasExclamation = text.includes('!');
    const hasQuestion = text.includes('?');
    const wordCount = text.split(/\s+/).length;

    let intensity = Math.min(textLength / 100, 1);
    let dominantAffect = 'neutral';
    let confidence = 0.3; // Baixa confiança para fallback

    if (hasExclamation) {
      intensity += 0.2;
      dominantAffect = 'excitement';
    }
    if (hasQuestion) {
      dominantAffect = 'curiosity';
    }
    if (wordCount > 20) {
      intensity += 0.1;
    }

    // Garantir limites
    intensity = Math.min(Math.max(intensity, 0), 1);

    return {
      intensity,
      dominantAffect,
      confidence,
      recommendation: intensity > 0.7 ? 'engage' : 'continue',
      emotionalShift: intensity > 0.5 ? 'rising' : 'stable',
      morphogenicSuggestion: dominantAffect === 'curiosity' ? 'spiral' : 'fibonacci'
    };
  }
}
