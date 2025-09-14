/**
 * Health endpoints refatorados com Clean Architecture
 * Usa Use Cases ao invés de lógica direta nas rotas
 */

import { Router, Request, Response } from 'express';
import { HealthCheckUseCase } from '../application/usecases/HealthCheckUseCase';
import { EmotionalAnalyzerAdapter } from '../infrastructure/adapters/EmotionalAnalyzerAdapter';
import { CacheServiceAdapter } from '../infrastructure/adapters/CacheServiceAdapter';
import { LoggerAdapter } from '../infrastructure/adapters/LoggerAdapter';

const router = Router();

// Configurar dependências
const analyzer = new EmotionalAnalyzerAdapter();
const cache = new CacheServiceAdapter();
const logger = new LoggerAdapter();

// Instanciar Use Case
const healthCheckUseCase = new HealthCheckUseCase(analyzer, cache, logger);

// GET /api/liveness - Verificação básica de vida do serviço
router.get('/liveness', async (req: Request, res: Response) => {
  try {
    const result = await healthCheckUseCase.checkLiveness();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Liveness check failed'
    });
  }
});

// GET /api/readiness - Verificação se o serviço está pronto para receber tráfego
router.get('/readiness', async (req: Request, res: Response) => {
  try {
    const result = await healthCheckUseCase.checkReadiness();
    
    if (result.ready) {
      res.json(result);
    } else {
      res.status(503).json(result);
    }
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      ready: false,
      timestamp: new Date().toISOString(),
      error: 'Readiness check failed'
    });
  }
});

// GET /api/status - Informações detalhadas do sistema
router.get('/status', async (req: Request, res: Response) => {
  try {
    const result = await healthCheckUseCase.getDetailedStatus();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Status check failed'
    });
  }
});

export { router as healthRouter };
export default router;
