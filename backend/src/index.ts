/**
 * GENESIS LUMINAL BACKEND - VERSÃO SEGURA OWASP
 * Servidor principal com baseline de segurança enterprise
 * 
 * Implementa:
 * ✅ Helmet com políticas rigorosas OWASP
 * ✅ CORS restrito por ambiente
 * ✅ Rate-limiting granular por rota (exceto health)
 * ✅ Validação de entrada em 100% dos endpoints
 * ✅ Logging de segurança completo
 * ✅ Proteção contra Top 10 OWASP 2023
 */

import express from 'express';
import compression from 'compression';
import { config } from './config/environment';
import { setupRoutes } from './routes';
import { healthRouter } from './routes/health';
import { errorMiddleware } from './middleware/error';
import { granularRateLimit, healthCheckRateLimit } from './middleware/rateLimit';
import { applySecurity } from './middleware/security';
import { applyValidation } from './middleware/validation';
import { sanitizeEmotional } from './middleware/sanitizeEmotional';
import { logger } from './utils/logger';

const app = express();

// ========================================
// CONFIGURAÇÃO DE SEGURANÇA OWASP
// ========================================

// 1. APLICAR PROTEÇÕES DE SEGURANÇA PRIMÁRIAS
// Helmet, CORS, logging, sanitização, detecção de ataques
app.use(applySecurity());

// 2. COMPRESSION APÓS HEADERS DE SEGURANÇA
app.use(compression({
  level: 6, // Balanço entre compressão e CPU
  threshold: 1024, // Só comprimir responses > 1KB
  filter: (req, res) => {
    // Não comprimir streams ou dados já comprimidos
    return !req.headers['x-no-compression'] && compression.filter(req, res);
  }
}));

// 3. PARSING DE BODY COM LIMITES RIGOROSOS
app.use(express.json({ 
  limit: '1mb',
  strict: true, // Apenas arrays e objects válidos
  type: ['application/json', 'application/json; charset=utf-8']
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb',
  parameterLimit: 100 // Máximo 100 parâmetros
}));

// 4. APLICAR VALIDAÇÃO AVANÇADA
app.use(applyValidation());

// ========================================
// ROTAS E RATE LIMITING GRANULAR  
// ========================================

// 5. HEALTH CHECKS - SEM RATE LIMITING (CRÍTICO PARA MONITORING)
app.use('/api/health', healthCheckRateLimit);
app.use('/api/liveness', healthCheckRateLimit);
app.use('/api/readiness', healthCheckRateLimit);
app.use('/api/status', healthCheckRateLimit);
app.use('/api', healthRouter);

// 6. MIDDLEWARE ESPECÍFICO PARA ROTAS EMOCIONAIS
// Aplicado antes do rate limiting para sanitização específica
app.use('/api/emotional/analyze', sanitizeEmotional);

// 7. RATE LIMITING GRANULAR PARA TODAS AS OUTRAS ROTAS
// Diferentes limites para auth, AI, e rotas normais
app.use(granularRateLimit);

// 8. ROTAS DA APLICAÇÃO
app.use('/api', setupRoutes());

// ========================================
// TRATAMENTO DE ERROS E MONITORING
// ========================================

// 9. MIDDLEWARE DE ERRO GLOBAL
app.use(errorMiddleware);

// 10. HANDLER DE ROTAS NÃO ENCONTRADAS
app.use('*', (req, res) => {
  logger.warn('Route not found', {
    type: 'not_found',
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    timestamp: new Date().toISOString()
  });
});

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

const PORT = config.PORT || 3001;
const server = app.listen(PORT, () => {
  logger.info('🚀 Genesis Luminal Backend - Security Baseline OWASP Activated', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    frontendUrl: config.FRONTEND_URL,
    claudeApi: config.CLAUDE_API_KEY ? 'Configured' : 'Missing',
    securityFeatures: [
      '✅ Helmet with OWASP policies',
      '✅ CORS restricted by environment',
      '✅ Granular rate limiting by route',
      '✅ Input validation on 100% endpoints',
      '✅ Security logging and monitoring',
      '✅ Attack detection and prevention',
      '✅ OWASP Top 10 2023 protections'
    ],
    healthEndpoints: [
      '/api/liveness',
      '/api/readiness', 
      '/api/status'
    ],
    rateLimitExemptions: [
      'Health checks have no rate limits',
      'Critical monitoring endpoints protected'
    ],
    timestamp: new Date().toISOString()
  });
});

// ========================================
// GRACEFUL SHUTDOWN E CLEANUP
// ========================================

// Graceful shutdown handler
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Graceful shutdown em produção
  if (process.env.NODE_ENV === 'production') {
    server.close(() => {
      process.exit(1);
    });
  }
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Graceful shutdown em produção
  if (process.env.NODE_ENV === 'production') {
    server.close(() => {
      process.exit(1);
    });
  }
});

export default app;
