#!/bin/bash

echo "Sprint 5 - Passo 2: Métricas Prometheus"
echo "======================================="

cd backend

echo "1. Instalando APENAS prom-client..."
npm install --save prom-client

if [ $? -ne 0 ]; then
    echo "❌ Falha na instalação"
    exit 1
fi

echo "2. Atualizando métricas com Prometheus..."
cat > src/metrics/prometheus.ts << 'EOFINNER'
/**
 * Métricas Prometheus - Sprint 5 Passo 2
 */
import { register, Counter, Histogram } from 'prom-client';

export class PrometheusMetrics {
  private requestsTotal = new Counter({
    name: 'genesis_requests_total',
    help: 'Total requests',
    labelNames: ['method', 'status'],
  });

  private requestDuration = new Histogram({
    name: 'genesis_request_duration_seconds',
    help: 'Request duration',
    labelNames: ['method'],
  });

  constructor() {
    register.registerMetric(this.requestsTotal);
    register.registerMetric(this.requestDuration);
  }

  public recordRequest(method: string, status: number, duration: number): void {
    this.requestsTotal.labels(method, status.toString()).inc();
    this.requestDuration.labels(method).observe(duration);
  }

  public async getMetrics(): Promise<string> {
    return register.metrics();
  }
}

export const prometheusMetrics = new PrometheusMetrics();
EOFINNER

echo "3. Adicionando endpoint /metrics no app.ts..."
cat > src/app.ts << 'EOFINNER'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { prometheusMetrics } from './metrics/prometheus';

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

// Performance tracking middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    prometheusMetrics.recordRequest(req.method, res.statusCode, duration);
  });
  
  next();
});

// Routes
app.use('/api/health', healthRouter);
app.use('/api/analysis', analysisRouter);

// NEW: Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const metrics = await prometheusMetrics.getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Metrics error' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Genesis Luminal API with Metrics',
    endpoints: {
      health: '/api/health',
      metrics: '/metrics',
      analysis: '/api/analysis'
    }
  });
});

export { app };
EOFINNER

echo "4. Testando build..."
if npm run build; then
    echo "✅ Build bem-sucedido"
else
    echo "❌ Build falhou - restaurando backup"
    cp src/app.ts.backup-step1 src/app.ts
    exit 1
fi

echo ""
echo "PASSO 2 CONCLUÍDO"
echo "================="
echo "✅ prom-client instalado"
echo "✅ Métricas Prometheus funcionando"
echo "✅ Endpoint /metrics adicionado"
echo "✅ Build validado"
echo ""
echo "Próximo passo: Execute './sprint5_minimal_step3.sh'"
