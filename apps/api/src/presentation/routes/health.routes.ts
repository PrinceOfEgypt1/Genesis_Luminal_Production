/**
 * Health Routes - Presentation Layer
 * IMPLEMENTADO: Rotas organizadas seguindo Clean Architecture
 */

import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';
import { HealthCheckUseCase } from '../../application/usecases/HealthCheckUseCase';
import { validateSchema, validateResponse } from '../../infrastructure/middleware/validation/zod-validator';
import {
  HealthQuerySchema,
  LivenessResponseSchema,
  ReadinessResponseSchema,
  SystemStatusResponseSchema
} from '../../contracts/v1/schemas';

// Criar instâncias dos use cases (poderia vir de DI container)
const healthCheckUseCase = new HealthCheckUseCase();
const healthController = new HealthController(healthCheckUseCase);

const router = Router();

// GET /api/liveness
router.get('/liveness',
  validateSchema({ query: HealthQuerySchema }),
  validateResponse(LivenessResponseSchema),
  (req, res, next) => healthController.checkLiveness(req, res).catch(next)
);

// GET /api/readiness
router.get('/readiness',
  validateSchema({ query: HealthQuerySchema }),
  validateResponse(ReadinessResponseSchema),
  (req, res, next) => healthController.checkReadiness(req, res).catch(next)
);

// GET /api/status
router.get('/status',
  validateSchema({ query: HealthQuerySchema }),
  validateResponse(SystemStatusResponseSchema),
  (req, res, next) => healthController.getSystemStatus(req, res).catch(next)
);

export { router as healthRoutes };
