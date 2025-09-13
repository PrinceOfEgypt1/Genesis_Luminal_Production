import { Router } from 'express';
import { ClaudeService } from '../services/ClaudeService';

const router = Router();
const service = new ClaudeService();

router.post('/analyze', async (req, res) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text : '';
    const result = await service.analyzeEmotionalState({ text } as any);
    res.status(200).json(result);
  } catch {
    res.status(200).json({
      intensity: 0.5,
      dominantAffect: 'neutral',
      timestamp: new Date().toISOString(),
      confidence: 0.5,
      recommendation: 'continue',
      emotionalShift: 'stable',
      morphogenicSuggestion: 'fibonacci'
    });
  }
});

export default router;
