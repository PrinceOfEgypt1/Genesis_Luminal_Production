/**
 * Health endpoints com validação Zod
 * ATUALIZADO: Validação runtime e error handling padronizado
 */

import { Router, Request, Response } from 'express';
import { validateSchema, validateResponse } from '../middleware/validation/zod-validator';
import {
  HealthQuerySchema,
  LivenessResponseSchema,
  ReadinessResponseSchema,
  SystemStatusResponseSchema
} from '../contracts/v1/schemas';
import { createApiError, ErrorCodes } from '../middleware/validation/error-handler';

const router = Router();

// GET /api/liveness - Verificação básica de vida do serviço
router.get('/liveness',
  validateSchema({ query: HealthQuerySchema }),
  validateResponse(LivenessResponseSchema),
  async (req: Request, res: Response) => {
    try {
      const result = {
        status: 'alive' as const,
        timestamp: new Date().toISOString()
      };

      res.json(result);
    } catch (error) {
      throw createApiError(
        500,
        ErrorCodes.INTERNAL_ERROR,
        'Falha na verificação de vida do serviço'
      );
    }
  }
);

// GET /api/readiness - Verificação se o serviço está pronto
router.get('/readiness',
  validateSchema({ query: HealthQuerySchema }),
  validateResponse(ReadinessResponseSchema),
  async (req: Request, res: Response) => {
    try {
      // Simular verificações de dependências
      const dependencies = await checkDependencies();
      const allHealthy = dependencies.every(dep => dep.status === 'healthy');
      
      const result = {
        status: allHealthy ? 'ready' : 'not_ready',
        ready: allHealthy,
        timestamp: new Date().toISOString(),
        services: dependencies
      };

      const statusCode = allHealthy ? 200 : 503;
      res.status(statusCode).json(result);
    } catch (error) {
      throw createApiError(
        503,
        ErrorCodes.SERVICE_UNAVAILABLE,
        'Falha na verificação de prontidão do serviço'
      );
    }
  }
);

// GET /api/status - Informações detalhadas do sistema
router.get('/status',
  validateSchema({ query: HealthQuerySchema }),
  validateResponse(SystemStatusResponseSchema),
  async (req: Request, res: Response) => {
    try {
      const uptime = process.uptime();
      
      const result = {
        status: 'operational',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: Math.floor(uptime),
        environment: (process.env.NODE_ENV || 'development') as 'development' | 'staging' | 'production',
        services: {
          database: 'connected',
          cache: 'available',
          external_api: 'operational'
        }
      };

      res.json(result);
    } catch (error) {
      throw createApiError(
        500,
        ErrorCodes.INTERNAL_ERROR,
        'Falha ao obter status do sistema'
      );
    }
  }
);

// Helper para verificar dependências
async function checkDependencies() {
  return [
    {
      name: 'database',
      status: 'healthy' as const,
      lastCheck: new Date().toISOString()
    },
    {
      name: 'cache',
      status: 'healthy' as const,
      lastCheck: new Date().toISOString()
    },
    {
      name: 'external_api',
      status: 'healthy' as const,
      lastCheck: new Date().toISOString()
    }
  ];
}

export { router as healthRouter };
export default router;
