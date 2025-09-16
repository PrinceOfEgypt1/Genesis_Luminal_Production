import { sanitizeEmotional } from './middleware/sanitizeEmotional';
/**
 * GENESIS LUMINAL BACKEND
 * Servidor principal com integração Claude API
 * CORREÇÃO: Rate limit aplicado APÓS rotas de saúde
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
app.use('/api/emotional/analyze', sanitizeEmotional);
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ✅ CORREÇÃO CRÍTICA: Health routes ANTES do rate limiting
app.use('/api', healthRouter);

// ✅ Rate limiting aplicado APÓS rotas de saúde
app.use(rateLimitMiddleware);

// Application routes
app.use('/api', setupRoutes());

// Error handling
app.use(errorMiddleware);

export default app;

// Debug logging
console.log('🔍 DEBUG: Starting server initialization...');
console.log('🔍 DEBUG: PORT variable:', PORT || 3001);
console.log('🔍 DEBUG: About to call app.listen...');
