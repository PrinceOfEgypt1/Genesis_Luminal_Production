/**
 * Emotional Analysis Routes - Presentation Layer
 * IMPLEMENTADO: Rotas organizadas seguindo Clean Architecture
 */

import { Router } from 'express';
import { EmotionalAnalysisController } from '../controllers/EmotionalAnalysisController';
import { AnalyzeEmotionalStateUseCase } from '../../application/usecases/AnalyzeEmotionalStateUseCase';
import { validateSchema, validateResponse, sanitizeInput } from '../../infrastructure/middleware/validation/zod-validator';
import {
  EmotionalAnalysisRequestSchema,
  EmotionalAnalysisResponseSchema
} from '../../contracts/v1/schemas';

// Criar instâncias dos use cases (poderia vir de DI container)
const analyzeEmotionalStateUseCase = new AnalyzeEmotionalStateUseCase();
const emotionalController = new EmotionalAnalysisController(analyzeEmotionalStateUseCase);

const router = Router();

// POST /api/emotional/analyze
router.post('/analyze',
  sanitizeInput(),
  validateSchema({ body: EmotionalAnalysisRequestSchema }),
  validateResponse(EmotionalAnalysisResponseSchema),
  (req, res, next) => emotionalController.analyzeEmotionalState(req, res).catch(next)
);

export { router as emotionalRoutes };
