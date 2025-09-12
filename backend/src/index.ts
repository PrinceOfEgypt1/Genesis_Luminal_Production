/**
 * GENESIS LUMINAL BACKEND
 * Servidor principal com integração Claude API
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/environment';
import { setupRoutes } from './routes';
import { healthRouter } from './routes/health';
import { errorMiddleware } from './middleware/error';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { logger } from './utils/logger';

const app = express();

// Timeout configurável
const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || '15000', 10);

// Middleware de timeout
app.use((req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({
        error: 'Request timeout',
        message: `Request exceeded ${REQUEST_TIMEOUT_MS}ms limit`
      });
    }
  }, REQUEST_TIMEOUT_MS);

  res.on('finish', () => clearTimeout(timeout));
  res.on('close', () => clearTimeout(timeout));
  
  next();
});

// Security & Performance middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true
}));

// Body parsing com limite reduzido
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting
app.use(rateLimitMiddleware);

// Health routes (sem rate limiting)
app.use('/api', healthRouter);

// Application routes
app.use('/api', setupRoutes());

// Error handling
app.use(errorMiddleware);

// Start server
const PORT = config.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`🚀 Genesis Luminal Backend running on port ${PORT}`);
  logger.info(`📡 Frontend URL: ${config.FRONTEND_URL}`);
  logger.info(`🧠 Claude API: ${config.CLAUDE_API_KEY ? 'Configured' : 'Missing'}`);
  logger.info(`⏱️  Request timeout: ${REQUEST_TIMEOUT_MS}ms`);
  logger.info(`🛡️  Health endpoints: /api/liveness, /api/readiness, /api/status`);
});
