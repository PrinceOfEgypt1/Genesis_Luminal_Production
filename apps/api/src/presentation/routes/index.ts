/**
 * Routes Index - Presentation Layer
 * IMPLEMENTADO: Centralização de rotas seguindo Clean Architecture
 */

import { Router } from 'express';
import { healthRoutes } from './health.routes';
import { emotionalRoutes } from './emotional.routes';

export function setupRoutes(): Router {
  const router = Router();

  // Health routes
  router.use('/', healthRoutes);

  // Emotional analysis routes
  router.use('/emotional', emotionalRoutes);

  return router;
}

export default setupRoutes;
