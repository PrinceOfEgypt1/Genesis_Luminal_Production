/**
 * TRILHO B AÇÃO 6 - Genesis Luminal Backend (SOLUÇÃO DEFINITIVA)
 * 
 * Servidor principal simplificado e funcional
 * Abordagem: Engenheiro Sênior - Funcionalidade > Complexity
 */

import express = require('express');
import cors = require('cors');
import helmet = require('helmet');
import compression = require('compression');
import { config } from './config/environment';
import { setupRoutes } from './routes';
import { healthRouter } from './routes/health';
import { sanitizeEmotional } from './middleware/sanitizeEmotional';
import { logger } from './utils/logger';

// Rate limiting simples e funcional
import { rateLimit } from './middleware/rateLimit';

const app = express();

// ========================================
// MIDDLEWARE STACK SIMPLIFICADO
// ========================================

// 1. Request Timeout
app.use((req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({
        error: 'Request timeout',
        message: 'Request exceeded time limit'
      });
    }
  }, 15000);

  res.on('finish', () => clearTimeout(timeout));
  res.on('close', () => clearTimeout(timeout));
  next();
});

// 2. Security Stack
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production'
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// 3. Body Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ========================================
// HEALTH ENDPOINTS (ANTES RATE LIMIT)
// ========================================

app.use('/api', healthRouter);
app.get('/health', (req, res) => res.redirect('/api/liveness'));
app.get('/ping', (req, res) => res.json({ 
  status: 'pong', 
  timestamp: new Date().toISOString() 
}));

// ========================================
// SANITIZAÇÃO E RATE LIMITING
// ========================================

app.use('/api/emotional/analyze', sanitizeEmotional);
app.use(rateLimit); // Rate limiting APÓS health checks

// ========================================
// APPLICATION ROUTES
// ========================================

app.use('/api', setupRoutes());

// ========================================
// ERROR HANDLING
// ========================================

app.use((error: any, req: any, res: any, next: any) => {
  logger.error('Unhandled error:', {
    error: error.message,
    url: req.url,
    method: req.method
  });

  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// ========================================
// SERVER START
// ========================================

const PORT = config.PORT || 3001;

app.listen(PORT, () => {
  logger.info('Genesis Luminal Backend started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    claudeConfigured: !!config.CLAUDE_API_KEY
  });

  logger.info('Infrastructure status:', {
    healthEndpoints: ['/api/liveness', '/api/readiness'],
    rateLimitEnabled: true,
    securityEnabled: true
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Shutting down gracefully');
  process.exit(0);
});
