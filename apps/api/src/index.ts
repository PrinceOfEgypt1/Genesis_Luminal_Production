/**
 * GENESIS LUMINAL BACKEND - SERVIDOR PRINCIPAL
 * Servidor com baseline de segurança OWASP implementado
 * Versão: 2.0 - Com segurança aprimorada
 */

import express from 'express';
import compression from 'compression';
import { config } from './config/environment';
import { setupRoutes } from './routes';
import { healthRouter } from './routes/health';
import { errorMiddleware } from './middleware/error';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { logger } from './utils/logger';

// Importar middlewares de segurança
import securityMiddleware from './middleware/security';
import validationMiddleware from './middleware/validation';

const app = express();

// ========================================
// CONFIGURAÇÃO DE SEGURANÇA E MIDDLEWARES
// ========================================

// 1. Timeout configurável
const REQUEST_TIMEOUT_MS = config.REQUEST_TIMEOUT_MS;
app.use((req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({
        error: 'Request timeout',
        message: `Request exceeded ${REQUEST_TIMEOUT_MS}ms limit`,
        timestamp: new Date().toISOString()
      });
    }
  }, REQUEST_TIMEOUT_MS);

  res.on('finish', () => clearTimeout(timeout));
  res.on('close', () => clearTimeout(timeout));
  
  next();
});

// 2. Security headers (Helmet com configuração OWASP)
app.use(securityMiddleware.helmetConfig);

// 3. Compression
app.use(compression());

// 4. CORS restrito por ambiente
app.use(securityMiddleware.corsConfig);

// 5. Payload size limiting
app.use(securityMiddleware.payloadSizeLimit(config.MAX_PAYLOAD_SIZE));

// 6. Body parsing com limite
app.use(express.json({ limit: config.MAX_PAYLOAD_SIZE }));
app.use(express.urlencoded({ extended: true, limit: config.MAX_PAYLOAD_SIZE }));

// 7. Security logging para requests suspeitos
if (config.ENABLE_SECURITY_LOGS) {
  app.use(securityMiddleware.securityLogger);
}

// ========================================
// ROTAS COM RATE LIMITING E VALIDAÇÃO
// ========================================

// Health endpoints (SEM rate limiting, COM validação)
app.use('/api', validationMiddleware.health, healthRouter);

// Rate limiting geral (aplicado após health endpoints)
app.use(rateLimitMiddleware);

// Endpoint de análise emocional com validação e rate limiting específicos
app.use('/api/emotional', 
  securityMiddleware.emotionalAnalysisRateLimit,
  securityMiddleware.emotionalAnalysisSlowDown,
  validationMiddleware.emotional
);

// Outras rotas da aplicação com validação básica
app.use('/api', validationMiddleware.basic, setupRoutes());

// ========================================
// MIDDLEWARE DE ERRO (SEMPRE POR ÚLTIMO)
// ========================================
app.use(errorMiddleware);

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

const PORT = config.PORT;

app.listen(PORT, () => {
  logger.info('🛡️ GENESIS LUMINAL BACKEND - SECURE VERSION STARTED', {
    port: PORT,
    environment: config.NODE_ENV,
    frontendUrl: config.FRONTEND_URL,
    claudeApi: config.CLAUDE_API_KEY ? 'Configured' : 'Missing',
    timeout: `${REQUEST_TIMEOUT_MS}ms`,
    security: {
      cors: 'Environment-restricted',
      rateLimit: 'Granular by route',
      validation: '100% endpoints',
      logging: config.ENABLE_SECURITY_LOGS ? 'Enabled' : 'Disabled'
    }
  });
  
  logger.info('🔒 Security Features Enabled:', {
    helmet: 'Advanced CSP',
    cors: 'Environment-based origins',
    rateLimit: 'Granular per route',
    validation: 'Zod schemas',
    payloadLimit: config.MAX_PAYLOAD_SIZE,
    securityLogging: config.ENABLE_SECURITY_LOGS
  });
  
  logger.info('🛡️ Protected Endpoints:', {
    health: '/api/{liveness,readiness,status} - No rate limit',
    emotional: '/api/emotional/* - 30 req/min + slow down',
    general: '/api/* - 100 req/15min',
    critical: '/api/{admin,config,system}/* - 10 req/hour'
  });
});

export default app;
