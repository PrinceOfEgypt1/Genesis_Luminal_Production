/**
 * GENESIS LUMINAL - SERVER STARTUP
 * Apenas inicialização do servidor
 */

import app from './app';
import { config } from './config/environment';
import { logger } from './utils/logger';

const PORT = config.PORT || 3001;

const server = app.listen(PORT, () => {
  logger.info(`🛡️ Genesis Luminal Backend running on port ${PORT}`);
  logger.info(`🔡 Frontend URL: ${config.FRONTEND_URL}`);
  logger.info(`🧠 Claude API: ${config.CLAUDE_API_KEY ? 'Configured' : 'Missing'}`);
  logger.info(`⏱️ Request timeout: 15000ms`);
  logger.info(`🛡️ Health endpoints: /api/liveness, /api/readiness, /api/status`);
  logger.info(`✅ OWASP Security: CORS restrito, Helmet CSP, Rate limiting granular`);
  logger.info(`🔒 Security Features: Environment-based CORS, Advanced CSP, Granular rate limits`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

export default app;
