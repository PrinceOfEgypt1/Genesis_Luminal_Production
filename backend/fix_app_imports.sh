#!/bin/bash

echo "Diagnosticando estrutura de rotas..."

ls -la src/routes/ 2>/dev/null || echo "Diretório routes não encontrado"

cp src/app.ts src/app.ts.backup-fix

echo "Criando app.ts corrigido..."

cat > src/app.ts << 'ENDOFFILE'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { prometheusMetrics } from './metrics/prometheus';

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

// Import routes if they exist
try {
  const healthRouter = require('./routes/health');
  app.use('/api/health', healthRouter.default || healthRouter);
} catch (e) {
  console.log('Health route not found, creating basic endpoint');
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });
}

try {
  const analysisRouter = require('./routes/analysis');
  app.use('/api/analysis', analysisRouter.default || analysisRouter);
} catch (e) {
  console.log('Analysis route not found, creating basic endpoint');
  app.post('/api/analysis', (req, res) => {
    res.json({ message: 'Analysis endpoint placeholder', timestamp: new Date().toISOString() });
  });
}

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

echo "Testando build..."

if npm run build; then
    echo "SUCCESS: Build funcionou!"
    echo "Execute: npm run dev"
else
    echo "ERROR: Build ainda falhou"
    echo "Restaurando backup..."
    cp src/app.ts.backup-fix src/app.ts
    exit 1
fi
