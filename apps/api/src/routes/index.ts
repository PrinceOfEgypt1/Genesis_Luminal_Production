import { Router } from 'express';
import health from './health';
import emotionalDefault, { emotionalRouter as emotionalNamed } from './emotional';

/** Retorna um Router montando todas as subrotas. */
export function setupRoutes() {
  const router = Router();

  // health.ts já registra /liveness, /readiness, /status internamente
  if (health) router.use(health);

  // aceita default OU named do módulo emotional
  const emotional = (emotionalDefault as any) || (emotionalNamed as any);
  if (emotional) {
    router.use('/emotional', emotional);
  } else {
    console.warn('[routes] emotional router ausente (nem default nem named).');
  }

  return router;
}

export default setupRoutes;
