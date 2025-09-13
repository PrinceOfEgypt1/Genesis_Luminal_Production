import type { Express } from 'express';
import health from './health';
import emotionalDefault, { emotionalRouter as emotionalNamed } from './emotional';

/**
 * Monta rotas do backend. Aceita tanto export default quanto named do módulo emotional.
 */
export default function setupRoutes(app: Express) {
  if (health) {
    app.use('/api/health', health);
  }

  const emotional = (emotionalDefault as any) || (emotionalNamed as any);
  if (!emotional) {
    // Mantém o servidor no ar, mas loga claramente se algo falhar
    console.warn('[routes] emotional router não carregado (default e named ausentes).');
  } else {
    app.use('/api/emotional', emotional);
  }
}
