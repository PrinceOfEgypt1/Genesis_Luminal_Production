/**
 * TRILHO B AÇÃO 6 - Genesis Luminal Backend Refatorado
 * 
 * Servidor principal com infraestrutura crosscutting separada
 * Aplicação de SOLID principles e separação de responsabilidades
 */

import express from 'express';
import { config } from './config/environment';
import { setupRoutes } from './routes';
import { healthRouter } from './routes/health';
import { errorMiddleware } from './middleware/error';
import { sanitizeEmotional } from './middleware/sanitizeEmotional';
import { logger } from './utils/logger';

// TRILHO B AÇÃO 6 - Infraestrutura Crosscutting Modular
import { createSecurityMiddleware, getEnvironmentSecurityConfig } from './infrastructure/security/SecurityMiddleware';
import { createRateLimitMiddleware } from './infrastructure/middleware/RateLimitMiddleware';
import { createInMemoryCacheService } from './infrastructure/cache/InMemoryCacheService';

// Inicializar infraestrutura crosscutting
const securityMiddleware = createSecurityMiddleware();
const rateLimitMiddleware = createRateLimitMiddleware({
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  windowSeconds: parseInt(process.env.RATE_LIMIT_WINDOW_SEC || '900', 10),
  blockDurationSeconds: parseInt(process.env.RATE_LIMIT_BLOCK_SEC || '900', 10),
  excludePaths: ['/api/liveness', '/api/readiness', '/api/health', '/api/status']
});
const cacheService = createInMemoryCacheService(
  parseInt(process.env.CACHE_TTL_SEC || '300', 10),
  parseInt(process.env.CACHE_MAX_SIZE || '1000', 10)
);

const app = express();

// ========================================
// MIDDLEWARES DE INFRAESTRUTURA
// ========================================

// 1. Request Timeout (antes de tudo)
const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || '15000', 10);
app.use((req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      logger.warn('Request timeout', { 
        url: req.url, 
        method: req.method,
        timeout: REQUEST_TIMEOUT_MS 
      });
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

// 2. Trust Proxy (para rate limiting correto)
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', true);
}

// 3. Security Middleware (CORS, Helmet, Compression)
const securityConfig = getEnvironmentSecurityConfig();
const securityMiddlewares = securityMiddleware.configure(securityConfig);
securityMiddlewares.forEach(middleware => app.use(middleware));

// 4. Body Parsing (com limites de segurança)
app.use(express.json({ 
  limit: process.env.REQUEST_SIZE_LIMIT || '1mb',
  verify: (req, res, buf) => {
    // Log de payloads suspeitos
    if (buf.length > 500000) { // 500KB
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
  limit: process.env.REQUEST_SIZE_LIMIT || '1mb' 
}));

// ========================================
// ROTAS DE SAÚDE (ANTES DO RATE LIMITING)
// ========================================

app.use('/api', healthRouter);

// Health endpoints alternativos (compatibilidade)
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
  windowSeconds: 300, // 5 minutos
  blockDurationSeconds: 600 // 10 minutos
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

const PORT = config.PORT || 3001;

app.listen(PORT, async () => {
  logger.info('Genesis Luminal Backend started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    frontendUrl: config.FRONTEND_URL,
    claudeConfigured: !!config.CLAUDE_API_KEY,
    requestTimeout: REQUEST_TIMEOUT_MS,
    rateLimit: {
      maxRequests: rateLimitMiddleware.getStats ? (await rateLimitMiddleware.getStats()).totalRequests : 'N/A',
      windowSeconds: process.env.RATE_LIMIT_WINDOW_SEC || '900'
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

// Disponibilizar serviços para outros módulos (se necessário)
export { cacheService, rateLimitMiddleware };
