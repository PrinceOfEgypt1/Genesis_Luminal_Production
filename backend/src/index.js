import express from 'express';
import { register, Counter, collectDefaultMetrics } from 'prom-client';
import { specs, swaggerUi } from './docs/swagger';
const app = express();
const PORT = 3001;
// Métricas básicas
collectDefaultMetrics();
const httpRequests = new Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'status']
});
app.use(express.json());
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check do sistema
 *     description: Verifica se o sistema está funcionando corretamente
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Sistema funcionando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
app.get('/api/health', (req, res) => {
    httpRequests.inc({ method: 'GET', status: '200' });
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
/**
 * @swagger
 * /api/emotional/analyze:
 *   post:
 *     summary: Análise emocional transcendental
 *     description: Realiza análise emocional baseada no estado atual do usuário
 *     tags:
 *       - Emotional Analysis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmotionalAnalysisRequest'
 *     responses:
 *       200:
 *         description: Análise realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmotionalAnalysisResponse'
 *       400:
 *         description: Dados de entrada inválidos
 *       500:
 *         description: Erro interno do servidor
 */
app.post('/api/emotional/analyze', (req, res) => {
    httpRequests.inc({ method: 'POST', status: '200' });
    // Simulação - conforme implementação existente
    res.json({
        success: true,
        intensity: 0.8,
        dominantAffect: 'joy',
        confidence: 0.85,
        recommendation: 'Continue explorando sua curiosidade natural',
        timestamp: new Date().toISOString()
    });
});
/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Métricas Prometheus
 *     description: Endpoint para coleta de métricas do sistema
 *     tags:
 *       - Monitoring
 *     responses:
 *       200:
 *         description: Métricas coletadas
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: |
 *                 # HELP http_requests_total Total HTTP requests
 *                 # TYPE http_requests_total counter
 *                 http_requests_total{method="GET",status="200"} 42
 */
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});
// Swagger UI endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
    console.log(`API Docs: http://localhost:${PORT}/api-docs`);
    console.log(`Metrics: http://localhost:${PORT}/metrics`);
});
