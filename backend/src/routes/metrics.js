/**
 * @fileoverview Metrics API Routes - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 *
 * Endpoints para exposição de métricas e monitoring
 */
import { Router } from 'express';
import { metrics } from '../monitoring/MetricsCollector';
import { logger } from '../monitoring/Logger';
const router = Router();
/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Obtém métricas do sistema
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Métricas do sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metrics:
 *                   type: object
 *                 timestamp:
 *                   type: string
 */
router.get('/metrics', (req, res) => {
    try {
        const allMetrics = metrics.getAllMetrics();
        const timestamp = new Date().toISOString();
        res.json({
            metrics: allMetrics,
            timestamp,
            service: 'genesis-luminal-backend',
            version: process.env.npm_package_version || '1.0.0'
        });
        logger.debug('Metrics endpoint accessed', {
            requestId: req.correlationId,
            metricsCount: Object.keys(allMetrics).length
        });
    }
    catch (error) {
        logger.error('Error retrieving metrics', {
            requestId: req.correlationId,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        res.status(500).json({
            error: 'Failed to retrieve metrics',
            timestamp: new Date().toISOString()
        });
    }
});
/**
 * @swagger
 * /api/metrics/prometheus:
 *   get:
 *     summary: Métricas no formato Prometheus
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Métricas em formato Prometheus
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get('/metrics/prometheus', (req, res) => {
    try {
        const prometheusMetrics = metrics.getPrometheusMetrics();
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(prometheusMetrics);
        logger.debug('Prometheus metrics endpoint accessed', {
            requestId: req.correlationId
        });
    }
    catch (error) {
        logger.error('Error retrieving Prometheus metrics', {
            requestId: req.correlationId,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        res.status(500).send('# Error retrieving metrics\n');
    }
});
/**
 * @swagger
 * /api/metrics/performance:
 *   get:
 *     summary: Métricas de performance com estatísticas
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Estatísticas de performance
 */
router.get('/metrics/performance', (req, res) => {
    try {
        const httpStats = metrics.getHistogramStats('http_request_duration_ms');
        const emotionStats = metrics.getHistogramStats('emotion_analysis_duration_ms');
        const performance = {
            http: httpStats,
            emotionAnalysis: emotionStats,
            system: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage()
            },
            timestamp: new Date().toISOString()
        };
        res.json(performance);
        logger.debug('Performance metrics endpoint accessed', {
            requestId: req.correlationId
        });
    }
    catch (error) {
        logger.error('Error retrieving performance metrics', {
            requestId: req.correlationId,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        res.status(500).json({
            error: 'Failed to retrieve performance metrics'
        });
    }
});
/**
 * @swagger
 * /api/metrics:
 *   post:
 *     summary: Recebe métricas do frontend
 *     tags: [Monitoring]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metric:
 *                 type: string
 *               value:
 *                 type: number
 *               labels:
 *                 type: object
 *     responses:
 *       200:
 *         description: Métrica recebida com sucesso
 */
router.post('/metrics', (req, res) => {
    try {
        const { metric, value, labels = {}, timestamp } = req.body;
        if (!metric || typeof value !== 'number') {
            return res.status(400).json({
                error: 'Invalid metric data. Required: metric (string), value (number)'
            });
        }
        // Adicionar labels do frontend
        const frontendLabels = {
            ...labels,
            source: 'frontend',
            userAgent: req.get('User-Agent')?.substring(0, 100) || 'unknown',
            url: req.body.url || 'unknown'
        };
        // Registrar métrica baseado no tipo
        if (metric.includes('_total') || metric.includes('_count')) {
            metrics.counter(metric, value, frontendLabels);
        }
        else {
            metrics.gauge(metric, value, frontendLabels);
        }
        logger.debug('Frontend metric received', {
            requestId: req.correlationId,
            metric,
            value,
            labels: frontendLabels
        });
        res.status(200).json({ status: 'received' });
    }
    catch (error) {
        logger.error('Error processing frontend metric', {
            requestId: req.correlationId,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        res.status(500).json({
            error: 'Failed to process metric'
        });
    }
});
/**
 * @swagger
 * /api/performance-alerts:
 *   post:
 *     summary: Recebe alertas de performance do frontend
 *     tags: [Monitoring]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metric:
 *                 type: string
 *               value:
 *                 type: number
 *               threshold:
 *                 type: number
 *               severity:
 *                 type: string
 *     responses:
 *       200:
 *         description: Alerta recebido com sucesso
 */
router.post('/performance-alerts', (req, res) => {
    try {
        const alert = req.body;
        logger.warn('Performance alert received from frontend', {
            requestId: req.correlationId,
            alert,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip
        });
        // Incrementar contador de alertas
        metrics.counter('performance_alerts_total', 1, {
            metric: alert.metric,
            severity: alert.severity,
            source: 'frontend'
        });
        res.status(200).json({ status: 'alert_received' });
    }
    catch (error) {
        logger.error('Error processing performance alert', {
            requestId: req.correlationId,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        res.status(500).json({
            error: 'Failed to process alert'
        });
    }
});
/**
 * @swagger
 * /api/health/detailed:
 *   get:
 *     summary: Health check detalhado com métricas
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Status detalhado do sistema
 */
router.get('/health/detailed', (req, res) => {
    try {
        const memory = process.memoryUsage();
        const uptime = process.uptime();
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'genesis-luminal-backend',
            version: process.env.npm_package_version || '1.0.0',
            uptime: {
                seconds: uptime,
                human: `${Math.floor(uptime / 60)} minutes`
            },
            memory: {
                rss: `${Math.round(memory.rss / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
                external: `${Math.round(memory.external / 1024 / 1024)}MB`
            },
            metrics: {
                logCount: logger.getMetrics(),
                metricsCount: Object.keys(metrics.getAllMetrics()).length
            },
            environment: process.env.NODE_ENV || 'development',
            nodeVersion: process.version
        };
        res.json(health);
    }
    catch (error) {
        logger.error('Error in detailed health check', {
            requestId: req.correlationId,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
        });
    }
});
export default router;
