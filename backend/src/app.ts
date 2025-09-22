import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { prometheusMetrics } from './metrics/prometheus';
import { logger } from './logging/logger';

// Import existing routes
import { router as analysisRouter } from './routes/analysis';
import { router as healthRouter } from './routes/health';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Request logging + metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  // Add request ID to headers
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);
  
  logger.info('Request started', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    
    // Record metrics
    prometheusMetrics.recordRequest(req.method, res.statusCode, duration);
    
    // Log completion
    logger.info('Request completed', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}s`
    });
  });
  
  next();
});

// Routes
app.use('/api/health', healthRouter);
app.use('/api/analysis', analysisRouter);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const metrics = await prometheusMetrics.getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    logger.error('Metrics endpoint error', { error: error.message });
    res.status(500).json({ error: 'Metrics error' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  logger.info('Root endpoint accessed');
  res.json({
    message: 'Genesis Luminal API with Observability',
    version: '1.0.0',
    features: ['metrics', 'structured-logging', 'request-tracking'],
    endpoints: {
      health: '/api/health',
      metrics: '/metrics',
      analysis: '/api/analysis'
    }
  });
});

// Error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Application error', {
    error: error.message,
    stack: error.stack,
    requestId: req.headers['x-request-id'],
    method: req.method,
    url: req.originalUrl
  });

  res.status(500).json({
    error: 'Internal server error',
    requestId: req.headers['x-request-id']
  });
});

export { app };
