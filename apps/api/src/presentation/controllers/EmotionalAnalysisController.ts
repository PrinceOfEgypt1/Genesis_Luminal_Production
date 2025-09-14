/**
 * Emotional Analysis Controller - Presentation Layer
 * IMPLEMENTADO: Controller seguindo Clean Architecture
 */

import { Request, Response } from 'express';
import { AnalyzeEmotionalStateUseCase } from '../../application/usecases/AnalyzeEmotionalStateUseCase';
import { TextAnalysisRequestSchema, BehavioralAnalysisRequestSchema } from '../../contracts/v1/schemas';
import { createApiError, ErrorCodes } from '../../infrastructure/middleware/validation/error-handler';

export class EmotionalAnalysisController {
  constructor(
    private readonly analyzeEmotionalStateUseCase: AnalyzeEmotionalStateUseCase
  ) {}

  async analyzeEmotionalState(req: Request, res: Response): Promise<void> {
    try {
      const analysisType = this.determineAnalysisType(req.body);
      
      let result;
      switch (analysisType) {
        case 'text':
          result = await this.analyzeEmotionalStateUseCase.analyzeText(req.body);
          break;
        case 'behavioral':
          result = await this.analyzeEmotionalStateUseCase.analyzeBehavior(req.body);
          break;
        default:
          throw createApiError(
            400,
            ErrorCodes.BAD_REQUEST,
            'Tipo de análise não reconhecido'
          );
      }

      res.json(result.toJSON());
    } catch (error) {
      if (error.name === 'ApiError') {
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

  private determineAnalysisType(body: any): 'text' | 'behavioral' {
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
}
