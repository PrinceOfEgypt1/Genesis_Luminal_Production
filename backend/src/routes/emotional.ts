import { Router } from 'express';
import { ClaudeService } from '../services/ClaudeService';
import { logger } from '../utils/logger';
import type { EmotionalAnalysisRequest } from '../../../shared/types/api';

const router = Router();
const claudeService = new ClaudeService();

// Input sanitization middleware
const sanitizeEmotionalInput = (req: any, res: any, next: any) => {
  try {
    const { text, currentState, metadata } = req.body;
    
    // Sanitize text input
    if (text && typeof text === 'string') {
      req.body.text = text.slice(0, 10000); // Limit text length
    }
    
    // Validate and sanitize currentState
    if (currentState && typeof currentState === 'object') {
      // Keep only valid emotional state properties
      const allowedKeys = ['joy', 'curiosity', 'transcendence', 'serenity', 'wonder', 'compassion'];
      const sanitized: any = {};
      
      for (const key of allowedKeys) {
        if (typeof currentState[key] === 'number' && !isNaN(currentState[key])) {
          sanitized[key] = Math.max(0, Math.min(1, currentState[key]));
        }
      }
      
      req.body.currentState = Object.keys(sanitized).length > 0 ? sanitized : undefined;
    }
    
    next();
  } catch (error) {
    logger.error('Error sanitizing emotional input:', error);
    res.status(400).json({ 
      error: 'Invalid request format',
      message: 'Request body contains invalid data'
    });
  }
};

router.post('/analyze', sanitizeEmotionalInput, async (req, res) => {
  try {
    const request: EmotionalAnalysisRequest = req.body;
    
    // Validate request
    if (!request.text && !request.currentState) {
      return res.status(400).json({
        error: 'Missing required data',
        message: 'Request must contain either text or currentState'
      });
    }

    const result = await claudeService.analyze(request);
    
    // Ensure dominantAffect is present for contract compliance
    const response = {
      ...result,
      dominantAffect: result.dominantAffect || 'curiosity',
      recommendation: ['continue', 'pause', 'intensify', 'explore', 'transcend'].includes(result.recommendation) 
        ? result.recommendation 
        : 'continue'
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Emotional analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: 'Unable to process emotional analysis request'
    });
  }
});

export default router;
