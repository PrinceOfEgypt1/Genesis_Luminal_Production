/**
 * Rotas para análise emocional
 */

import { Router } from 'express';
import { ClaudeService } from '../services/ClaudeService';
import { logger } from '../utils/logger';

const router = Router();
const claudeService = new ClaudeService();

// POST /api/emotional/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { currentState, mousePosition, sessionDuration } = req.body;

    // Validação básica
    if (!currentState || !mousePosition || sessionDuration === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: currentState, mousePosition, sessionDuration'
      });
    }

    const analysis = await claudeService.analyzeEmotionalState({
      currentState,
      mousePosition,
      sessionDuration,
      userId: req.ip // Simples identificador baseado em IP
    });

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Emotional analysis error:', error);
    res.status(500).json({
      error: 'Internal server error',
      fallback: true // Indica que frontend deve usar fallback
    });
  }
});

export { router as emotionalRoutes };
