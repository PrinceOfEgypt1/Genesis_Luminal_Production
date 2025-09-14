/**
 * TRILHO B AÇÃO 6 - Genesis Luminal Backend Refatorado (CORRIGIDO)
 * 
 * Servidor principal com infraestrutura crosscutting separada
 * Correção: Type compatibility e imports
 */

import * as express from 'express';
import { config } from './config/environment';
import { setupRoutes } from './routes';
import { healthRouter } from './routes/health';
import { errorMiddleware } from './infrastructure/middleware/error';
import { sanitizeEmotional } from './middleware/sanitizeEmotional';
import { logger } from './utils/logger';

// TRILHO B AÇÃO 6 - Infraestrutura Crosscutting Modular
import { createSecurityMiddleware, getEnvironmentSecurityConfig } from './infrastructure/security/SecurityMiddleware';
import { createRateLimitMiddleware } from './infrastructure/middleware/RateLimitMiddleware';
import { createInMemoryCacheService } from './infrastructure/cache/InMemoryCacheService';

// Inicializar infraestrutura crosscutting
const securityMiddleware = createSecurityMiddleware();
const rateLimitMiddleware = createRateLimitMiddleware({
  maxRequests: config.RATE_LIMIT_MAX,
  windowSeconds: config.RATE_LIMIT_WINDOW_SEC,
  blockDurationSeconds: config.RATE_LIMIT_BLOCK_SEC,
  excludePaths: ['/api/liveness', '/api/readiness', '/api/health', '/api/status']
});
const cacheService = createInMemoryCacheService(
  config.CACHE_TTL_SEC,
  config.CACHE_MAX_SIZE
);

const app = express();

// ========================================
// MIDDLEWARES DE INFRAESTRUTURA
// ========================================

// 1. Request Timeout
app.use((req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      logger.warn('Request timeout', { 
        url: req.url, 
        method: req.method,
        timeout: config.REQUEST_TIMEOUT_MS 
      });
      res.status(503).json({
        error: 'Request timeout',
        message: `Request exceeded ${config.REQUEST_TIMEOUT_MS}ms limit`
      });
    }
  }, config.REQUEST_TIMEOUT_MS);

  res.on('finish', () => clearTimeout(timeout));
  res.on('close', () => clearTimeout(timeout));
  
  next();
});

// 2. Trust Proxy
if (config.TRUST_PROXY) {
  app.set('trust proxy', true);
}

// 3. Security Middleware (CORS, Helmet, Compression)
// CORREÇÃO: Usar configuração default se getEnvironmentSecurityConfig retornar vazio
const securityConfig = getEnvironmentSecurityConfig();
const securityMiddlewares = securityMiddleware.configure(Object.keys(securityConfig).length > 0 ? securityConfig : undefined);
securityMiddlewares.forEach(middleware => app.use(middleware));

// 4. Body Parsing
app.use(express.json({ 
  limit: config.REQUEST_SIZE_LIMIT,
  verify: (req, res, buf) => {
    if (buf.length > 500000) {
      logger.warn('Large payload received', { 
        size: buf.length, 
        path: req.path,
        contentType: req.get('Content-Type')
      });
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: config.REQUEST_SIZE_LIMIT 
}));

// ========================================
// ROTAS DE SAÚDE (ANTES DO RATE LIMITING)
// ========================================

app.use('/api', healthRouter);

// Health endpoints alternativos
app.get('/health', (req, res) => res.redirect('/api/liveness'));
app.get('/ping', (req, res) => res.json({ status: 'pong', timestamp: new Date().toISOString() }));

// ========================================
// SANITIZAÇÃO ESPECÍFICA
// ========================================

app.use('/api/emotional/analyze', sanitizeEmotional);

// ========================================
// RATE LIMITING (APÓS HEALTH CHECKS)
// ========================================

app.use(rateLimitMiddleware.middleware());

// Rate limiting específico para endpoints sensíveis
app.use('/api/emotional', rateLimitMiddleware.strictMiddleware({
  maxRequests: 50,
  windowSeconds: 300,
  blockDurationSeconds: 600
}));

// ========================================
// ROTAS DA APLICAÇÃO
// ========================================

app.use('/api', setupRoutes());

// ========================================
// MIDDLEWARE DE ERRO (ÚLTIMO)
// ========================================

app.use(errorMiddleware);

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

app.listen(config.PORT, async () => {
  logger.info('Genesis Luminal Backend started', {
    port: config.PORT,
    environment: config.NODE_ENV,
    frontendUrl: config.FRONTEND_URL,
    claudeConfigured: !!config.CLAUDE_API_KEY,
    requestTimeout: config.REQUEST_TIMEOUT_MS,
    rateLimit: {
      maxRequests: config.RATE_LIMIT_MAX,
      windowSeconds: config.RATE_LIMIT_WINDOW_SEC
    }
  });

  // Verificar saúde da infraestrutura
  const cacheHealthy = await cacheService.isHealthy();
  logger.info('Infrastructure health check', {
    cache: cacheHealthy ? 'healthy' : 'unhealthy'
  });

  logger.info('Protected endpoints:', {
    health: ['/api/liveness', '/api/readiness', '/api/status'],
    rateLimited: ['/api/emotional/*'],
    strictRateLimit: ['/api/emotional/analyze']
  });
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export { cacheService, rateLimitMiddleware };
