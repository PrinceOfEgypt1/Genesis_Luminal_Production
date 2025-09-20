/**
 * GENESIS LUMINAL BACKEND WITH OPENTELEMETRY
 * Servidor principal com integração Claude API e observabilidade completa
 *
 * IMPORTANTE: Instrumentação DEVE ser inicializada antes de qualquer import
 */
// 🔍 INICIALIZAR OPENTELEMETRY PRIMEIRO
import { initializeInstrumentation } from './telemetry/instrumentation';
initializeInstrumentation();
// Imports da aplicação (após instrumentação)
import { sanitizeEmotional } from './middleware/sanitizeEmotional';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/environment';
import { setupRoutes } from './routes';
import { healthRouter } from './routes/health';
import { errorMiddleware } from './middleware/error';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { telemetryMiddleware, emotionalAnalysisTelemetry } from './middleware/telemetry';
import { logger } from './utils/logger';
import { getTelemetryStatus } from './telemetry';
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
// 🔍 TELEMETRIA - Primeiro middleware após timeout
app.use(telemetryMiddleware);
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
// Endpoint de métricas Prometheus
app.get('/metrics', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send('# Metrics available at Prometheus endpoint\n# Check port 9464');
});
// Endpoint de status de telemetria
app.get('/api/telemetry/status', (req, res) => {
    const status = getTelemetryStatus();
    res.json({
        ...status,
        timestamp: new Date().toISOString(),
        service: 'genesis-luminal-api',
        version: '1.0.0'
    });
});
// ✅ Rate limiting aplicado APÓS rotas de saúde
app.use(rateLimitMiddleware);
// Telemetria específica para análise emocional
app.use('/api/emotional', emotionalAnalysisTelemetry);
// Application routes
app.use('/api', setupRoutes());
// Error handling
app.use(errorMiddleware);
// Start server
const PORT = config.PORT || 3001;
app.listen(PORT, () => {
    const telemetryStatus = getTelemetryStatus();
    logger.info(`🚀 Genesis Luminal Backend running on port ${PORT}`);
    logger.info(`🔡 Frontend URL: ${config.FRONTEND_URL}`);
    logger.info(`🧠 Claude API: ${config.CLAUDE_API_KEY ? 'configured' : 'missing'}`);
    // Log telemetry status
    logger.info('🔍 OpenTelemetry Status:', telemetryStatus);
    logger.info(`📊 Prometheus metrics: http://localhost:${process.env.PROMETHEUS_PORT || '9464'}/metrics`);
    logger.info(`📈 Telemetry status: http://localhost:${PORT}/api/telemetry/status`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('🔄 Graceful shutdown initiated');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger.info('🔄 Graceful shutdown initiated');
    process.exit(0);
});
