/**
 * GENESIS LUMINAL BACKEND
 * Servidor principal com integração Claude API
 * TRILHO B - Ação 6: Infraestrutura Crosscutting Separada
 * 
 * CORREÇÃO: Rate limit aplicado APÓS rotas de saúde
 * MELHORIA: Security middleware separado seguindo SRP
 * FIX: Export default para compatibilidade com testes
 */

import express from 'express';
import { config } from './config/environment';
import { setupRoutes } from './routes';
import { healthRouter } from './routes/health';
import { sanitizeEmotional } from './middleware/sanitizeEmotional';
import { SecurityMiddleware, rateLimitMiddleware, errorMiddleware } from './middleware';
import { logger } from './utils/logger';

const app = express();

// ========================================
// CONFIGURAÇÃO DE TIMEOUT
// ========================================

const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || '15000', 10);

// Middleware de timeout configurável
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

// ========================================
// INFRAESTRUTURA CROSSCUTTING - SEGURANÇA
// ========================================

// Aplicar middleware de segurança usando classe dedicada
const isProduction = config.NODE_ENV === 'production';
const securityConfig = isProduction 
  ? SecurityMiddleware.forProduction()
  : SecurityMiddleware.forDevelopment();

SecurityMiddleware.apply(
  app,
  securityConfig.corsConfig,
  securityConfig.helmetConfig
);

// Headers customizados de segurança
app.use(SecurityMiddleware.customSecurityHeaders());

// ========================================
// BODY PARSING E SANITIZAÇÃO
// ========================================

// Body parsing com limite controlado
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Sanitização específica para rotas emocionais
app.use('/api/emotional/analyze', sanitizeEmotional);

// ========================================
// ROTAS - ORDEM CRÍTICA
// ========================================

// ✅ CORREÇÃO CRÍTICA: Health routes ANTES do rate limiting
// Health checks devem estar sempre disponíveis sem limitação
app.use('/api', healthRouter);

// ✅ Rate limiting aplicado APÓS rotas de saúde
// Protege APIs de negócio mas mantém health checks livres
app.use(rateLimitMiddleware);

// Application routes - APIs de negócio
app.use('/api', setupRoutes());

// ========================================
// ERROR HANDLING - SEMPRE POR ÚLTIMO
// ========================================

app.use(errorMiddleware);

// ========================================
// INICIALIZAÇÃO DO SERVIDOR (apenas se não for teste)
// ========================================

const PORT = config.PORT || 3001;

// Só inicia servidor se não estiver sendo importado para testes
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info('🚀 ===== GENESIS LUMINAL BACKEND INICIADO =====');
    logger.info(`📡 Servidor rodando na porta: ${PORT}`);
    logger.info(`🌐 Frontend URL: ${config.FRONTEND_URL}`);
    logger.info(`🧠 Claude API: ${config.CLAUDE_API_KEY ? 'Configurado' : 'Missing'}`);
    logger.info(`⏱️ Request timeout: ${REQUEST_TIMEOUT_MS}ms`);
    logger.info(`🛡️ Ambiente: ${config.NODE_ENV}`);
    logger.info(`🔒 Security middleware: Ativo`);
    logger.info(`📊 Health endpoints: /api/liveness, /api/readiness, /api/status`);
    logger.info(`⚡ Rate limiting: Ativo (exceto health checks)`);
    logger.info('✅ TRILHO B - Ação 6: Infraestrutura Crosscutting separada');
    logger.info('🎯 ===== SERVIDOR PRONTO PARA RECEBER REQUESTS =====');
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    logger.info('🛑 Recebido SIGINT, iniciando graceful shutdown...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('🛑 Recebido SIGTERM, iniciando graceful shutdown...');
    process.exit(0);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('💥 Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

// ✅ EXPORT DEFAULT para compatibilidade com testes
export default app;
