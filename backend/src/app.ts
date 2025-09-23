import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { prometheusMetrics } from './metrics/prometheus';
import { logger } from './logging/logger';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);
  
  logger.info('Request iniciado', { requestId, method: req.method, url: req.originalUrl });
  
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    prometheusMetrics.recordRequest(req.method, res.statusCode, duration);
    
    logger.info('Request concluído', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}s`
    });
  });
  
  next();
});

app.get('/', (req, res) => {
  res.json({
    message: 'Genesis Luminal API com Observabilidade Completa',
    version: '1.0.0',
    features: ['prometheus-metrics', 'structured-logging', 'request-tracking'],
    endpoints: { health: '/api/health', metrics: '/metrics', analysis: '/api/analysis' }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/analysis', (req, res) => {
  res.json({ message: 'Analysis endpoint', timestamp: new Date().toISOString() });
});

app.get('/metrics', async (req, res) => {
  try {
    const metrics = await prometheusMetrics.getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    logger.error('Erro no endpoint metrics', { error: String(error) });
    res.status(500).json({ error: 'Internal metrics error' });
  }
});

export { app };
