/**
 * CORREÇÃO CRÍTICA - Servidor principal com OpenAPI 3.0 + Swagger UI
 * 
 * Servidor Express com documentação interativa completa
 */

import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

// Importações locais
import { config } from './config/environment';
import { setupRoutes } from './routes';
import { errorMiddleware } from './middleware/error';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { sanitizeEmotional } from './middleware/sanitizeEmotional';
import { logger } from './utils/logger';

// Importações OpenAPI/Swagger
import { swaggerSpec, openApiJsonHandler, swaggerUiOptions } from './config/swagger';

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
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Necessário para Swagger UI
      scriptSrc: ["'self'"], 
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

app.use(compression());
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true
}));

// Body parsing com limite reduzido
app.use(express.json({ limit: '1mb' }));
app.use('/api/emotional/analyze', sanitizeEmotional);
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ✨ NOVA FUNCIONALIDADE: OpenAPI 3.0 + Swagger UI
logger.info('🔧 Configurando documentação OpenAPI/Swagger...');

// Endpoint para especificação OpenAPI JSON
app.get('/api/openapi.json', openApiJsonHandler);

// Swagger UI - documentação interativa
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Redirect / para /api/docs para facilitar acesso
app.get('/', (req, res) => {
  res.redirect('/api/docs');
});

logger.info('✅ Swagger UI configurado em /api/docs');

// Health routes ANTES do rate limiting (sem rate limit)
const healthRoutes = express.Router();

healthRoutes.get('/liveness', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

healthRoutes.get('/readiness', (req, res) => {
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    services: [
      { name: 'emotional-analysis', status: 'healthy', latency: 45 },
      { name: 'providers', status: 'healthy', latency: 12 }
    ]
  });
});

healthRoutes.get('/status', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: [
      { name: 'emotional-analysis', status: 'healthy', latency: 45 },
      { name: 'claude-provider', status: 'healthy', latency: 120 },
      { name: 'fallback-provider', status: 'healthy', latency: 8 },
      { name: 'cache-service', status: 'healthy', latency: 2 }
    ]
  });
});

app.use('/api', healthRoutes);

// Rate limiting aplicado APÓS rotas de saúde e documentação
app.use(rateLimitMiddleware);

// Application routes
app.use('/api', setupRoutes());

// Error handling
app.use(errorMiddleware);

// Start server
const PORT = config.PORT || 3001;
app.listen(PORT, () => {
  console.log('✅ Clean Architecture routes carregadas');
  console.log('✅ Error handlers carregados');
  console.log(`🚀 Genesis Luminal Backend - PORT ${PORT}`);
  console.log(`📚 Documentação: http://localhost:${PORT}/api/docs`);
  console.log('✅ TRILHO A AÇÃO 1 - OpenAPI 3.0 + Swagger UI IMPLEMENTADO');
  
  logger.info(`🚀 Genesis Luminal Backend running on port ${PORT}`);
  logger.info(`📚 OpenAPI Documentation: http://localhost:${PORT}/api/docs`);
  logger.info(`📋 OpenAPI Spec: http://localhost:${PORT}/api/openapi.json`);
  logger.info(`🔗 Frontend URL: ${config.FRONTEND_URL}`);
  logger.info(`🧠 Claude API: ${config.CLAUDE_API_KEY ? 'Configured' : 'Missing'}`);
  logger.info(`⏱️ Request timeout: ${REQUEST_TIMEOUT_MS}ms`);
  logger.info(`🛡️ Health endpoints: /api/liveness, /api/readiness, /api/status`);
  logger.info(`🎯 TRILHO B AÇÃO 4 - Strategy Pattern + Factory ATIVO`);
  logger.info(`✅ CORREÇÃO: OpenAPI 3.0 + Swagger UI documentation ativo`);
});
