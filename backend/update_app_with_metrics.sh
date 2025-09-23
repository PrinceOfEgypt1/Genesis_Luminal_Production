#!/bin/bash

echo "Atualizando app.ts com métricas Prometheus..."

cp src/app.ts src/app.ts.backup-metrics

cat > src/app.ts << 'ENDOFFILE'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { prometheusMetrics } from './metrics/prometheus';
import { router as analysisRouter } from './routes/analysis';
import { router as healthRouter } from './routes/health';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    prometheusMetrics.recordRequest(req.method, res.statusCode, duration);
  });
  
  next();
});

app.use('/api/health', healthRouter);
app.use('/api/analysis', analysisRouter);

app.get('/metrics', async (req, res) => {
  try {
    const metrics = await prometheusMetrics.getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Internal metrics error' });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'Genesis Luminal API with Prometheus Metrics',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      metrics: '/metrics',
      analysis: '/api/analysis'
    },
    timestamp: new Date().toISOString()
  });
});

export { app };
ENDOFFILE

echo "App.ts atualizado. Testando build..."

if npm run build; then
    echo "SUCCESS: Build funcionou"
    echo "Execute: npm run dev"
else
    echo "ERROR: Build falhou - restaurando backup"
    cp src/app.ts.backup-metrics src/app.ts
    exit 1
fi
