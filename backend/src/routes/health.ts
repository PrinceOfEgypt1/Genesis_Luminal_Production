/**
 * Health endpoints para monitoramento e observabilidade
 */

import { Router, Request, Response } from 'express';
import { config } from '../config/environment';

const router = Router();

// GET /api/liveness - Verificação básica de vida do serviço
router.get('/liveness', (req: Request, res: Response) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

// GET /api/readiness - Verificação se o serviço está pronto para receber tráfego
router.get('/readiness', (req: Request, res: Response) => {
  // Checagem simples - pode ser expandida com verificações de dependências
  const isReady = true; // TODO: adicionar checagens de DB, Redis, APIs externas, etc.
  
  if (isReady) {
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/status - Informações detalhadas do sistema
router.get('/status', (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  
  const status = {
    status: 'ok',
    service: 'Genesis Luminal Claude',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    memory_mb: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024)
    },
    claude_api_key: config.CLAUDE_API_KEY ? 'configured' : 'missing'
  };
  
  res.json(status);
});

export { router as healthRouter };
export default router;
