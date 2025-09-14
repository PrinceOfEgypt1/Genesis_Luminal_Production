/**
 * Rotas emocionais refatoradas com Clean Architecture
 * Usa Use Cases ao invés de Services diretamente
 */

import { Router } from 'express';
import { AnalyzeEmotionalStateUseCase } from '../application/usecases/AnalyzeEmotionalStateUseCase';
import { EmotionalAnalyzerAdapter } from '../infrastructure/adapters/EmotionalAnalyzerAdapter';
import { CacheServiceAdapter } from '../infrastructure/adapters/CacheServiceAdapter';
import { LoggerAdapter } from '../infrastructure/adapters/LoggerAdapter';

const router = Router();

// Configurar dependências (Dependency Injection)
const analyzer = new EmotionalAnalyzerAdapter();
const cache = new CacheServiceAdapter();
const logger = new LoggerAdapter();

// Instanciar Use Case
const analyzeEmotionalStateUseCase = new AnalyzeEmotionalStateUseCase(
  analyzer,
  cache,
  logger
);

router.post('/analyze', async (req, res) => {
  try {
    // Preparar request baseado no body
    const request = req.body.emotionalState
      ? {
          currentState: req.body.emotionalState,
          mousePosition: req.body.mousePosition,
          sessionDuration: req.body.sessionDuration,
          userId: req.body.userId
        }
      : {
          text: req.body.text || req.body.message || ''
        };

    // Executar Use Case
    const result = await analyzeEmotionalStateUseCase.execute(request as any);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in emotional analysis endpoint', { error, body: req.body });
    
    // Fallback response
    res.status(200).json({
      intensity: 0.5,
      dominantAffect: 'curiosity',
      timestamp: new Date().toISOString(),
      confidence: 0.5,
      recommendation: 'system_error',
      emotionalShift: 'stable',
      morphogenicSuggestion: 'fibonacci'
    });
  }
});

export default router;
export const emotionalRouter = router;
