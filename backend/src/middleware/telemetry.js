/**
 * @fileoverview Middleware de Telemetria
 *
 * Middleware Express para adicionar correlation IDs,
 * registrar métricas e criar spans automáticos
 *
 * @version 1.0.0
 * @author Senior Software Engineering Team
 */
import { generateCorrelationId, setCorrelationId } from '../observability/tracing';
import { recordHttpRequestLatency } from '../observability/metrics';
/**
 * Middleware principal de telemetria
 */
export function telemetryMiddleware(req, res, next) {
    // Gerar ou usar correlation ID existente
    const correlationId = req.headers['x-correlation-id'] ||
        req.headers['x-request-id'] ||
        generateCorrelationId();
    // Adicionar ao request
    req.correlationId = correlationId;
    req.startTime = Date.now();
    // Adicionar aos headers de resposta
    res.setHeader('x-correlation-id', correlationId);
    res.setHeader('x-trace-id', correlationId);
    // Configurar contexto de tracing
    setCorrelationId(correlationId);
    // Registrar métricas quando resposta for enviada
    res.on('finish', () => {
        const duration = Date.now() - req.startTime;
        const route = req.route?.path || req.path || 'unknown';
        recordHttpRequestLatency(duration, req.method, route, res.statusCode);
    });
    next();
}
/**
 * Middleware específico para endpoints de análise emocional
 */
export function emotionalAnalysisTelemetry(req, res, next) {
    // Adicionar contexto específico para análise emocional
    res.setHeader('x-analysis-type', 'emotional');
    res.setHeader('x-service', 'genesis-luminal');
    next();
}
