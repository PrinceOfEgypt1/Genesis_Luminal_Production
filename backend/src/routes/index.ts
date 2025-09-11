/**
 * Configuração de rotas principais
 */

import { Router } from 'express';
import { emotionalRoutes } from './emotional';

export function setupRoutes(): Router {
  const router = Router();

  // Rotas de análise emocional
  router.use('/emotional', emotionalRoutes);

  return router;
}
