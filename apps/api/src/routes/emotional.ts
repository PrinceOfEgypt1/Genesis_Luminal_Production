/**
 * Rotas de análise emocional com validação Zod
 * ATUALIZADO: Validação runtime rigorosa e error handling padronizado
 */

import { Router, Request, Response } from 'express';
import { validateSchema, validateResponse, sanitizeInput } from '../middleware/validation/zod-validator';
import {
  EmotionalAnalysisRequestSchema,
  EmotionalAnalysisResponseSchema,
  TextAnalysisRequestSchema,
  BehavioralAnalysisRequestSchema
} from '../contracts/v1/schemas';
import { createApiError, ErrorCodes } from '../middleware/validation/error-handler';

const router = Router();

// POST /api/emotional/analyze - Análise de estado emocional
router.post('/analyze',
  sanitizeInput(),
  validateSchema({ 
    body: EmotionalAnalysisRequestSchema 
  }),
  validateResponse(EmotionalAnalysisResponseSchema),
  async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();
      
      // Determinar tipo de análise
      const analysisType = determineAnalysisType(req.body);
      
      // Executar análise baseada no tipo
      let result;
      switch (analysisType) {
        case 'text':
          result = await processTextAnalysis(req.body);
          break;
        case 'behavioral':
          result = await processBehavioralAnalysis(req.body);
          break;
        default:
          throw createApiError(
            400,
            ErrorCodes.BAD_REQUEST,
            'Tipo de análise não reconhecido'
          );
      }

      const processingTime = Date.now() - startTime;
      
      // Adicionar metadata
      const response = {
        ...result,
        timestamp: new Date().toISOString(),
        metadata: {
          processingTimeMs: processingTime,
          source: analysisType,
          version: 'v1'
        }
      };

      res.json(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'ApiError') {
        throw error;
      }
      
      console.error('Erro na análise emocional:', error);
      throw createApiError(
        500,
        ErrorCodes.INTERNAL_ERROR,
        'Falha na análise emocional'
      );
    }
  }
);

// Determinar tipo de análise baseado no body
function determineAnalysisType(body: any): 'text' | 'behavioral' {
  try {
    TextAnalysisRequestSchema.parse(body);
    return 'text';
  } catch {
    try {
      BehavioralAnalysisRequestSchema.parse(body);
      return 'behavioral';
    } catch {
      throw createApiError(
        400,
        ErrorCodes.VALIDATION_ERROR,
        'Formato de requisição inválido'
      );
    }
  }
}

// Processar análise de texto
async function processTextAnalysis(data: any) {
  const text = data.text;
  
  // Análise básica de sentimento baseada em palavras-chave
  const positiveWords = ['feliz', 'alegre', 'ótimo', 'excelente', 'maravilhoso', 'amor'];
  const negativeWords = ['triste', 'ruim', 'péssimo', 'ódio', 'raiva', 'deprimido'];
  
  const lowerText = text.toLowerCase();
  const positiveMatches = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeMatches = negativeWords.filter(word => lowerText.includes(word)).length;
  
  let dominantAffect: string;
  let intensity: number;
  let emotionalShift: string;
  
  if (positiveMatches > negativeMatches) {
    dominantAffect = 'joy';
    intensity = Math.min(0.8, 0.4 + (positiveMatches * 0.2));
    emotionalShift = 'positive';
  } else if (negativeMatches > positiveMatches) {
    dominantAffect = 'sadness';
    intensity = Math.min(0.8, 0.4 + (negativeMatches * 0.2));
    emotionalShift = 'negative';
  } else {
    dominantAffect = 'neutral';
    intensity = 0.5;
    emotionalShift = 'stable';
  }
  
  return {
    intensity,
    dominantAffect,
    confidence: 0.75,
    recommendation: intensity > 0.6 ? 'enhance_positive' : 'continue',
    emotionalShift,
    morphogenicSuggestion: 'spiral'
  };
}

// Processar análise comportamental
async function processBehavioralAnalysis(data: any) {
  const { emotionalState, mousePosition, sessionDuration } = data;
  
  // Calcular intensidade baseada no estado emocional
  const avgResonance = emotionalState.resonancePatterns.reduce((a: number, b: number) => a + b, 0) / 
                      emotionalState.resonancePatterns.length;
  
  const intensity = (emotionalState.morphogeneticField + avgResonance + emotionalState.quantumCoherence) / 3;
  
  // Análise baseada na duração da sessão
  let dominantAffect: string;
  let recommendation: string;
  
  if (sessionDuration > 300000) { // > 5 minutos
    dominantAffect = 'contemplation';
    recommendation = 'explore_deeper';
  } else if (intensity > 0.7) {
    dominantAffect = 'excitement';
    recommendation = 'enhance_positive';
  } else {
    dominantAffect = 'curiosity';
    recommendation = 'continue';
  }
  
  return {
    intensity,
    dominantAffect,
    confidence: 0.85,
    recommendation,
    emotionalShift: 'stable',
    morphogenicSuggestion: 'fibonacci'
  };
}

export { router as emotionalRouter };
export default router;
