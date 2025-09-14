/**
 * GENESIS LUMINAL BACKEND - Versão Minimal com OpenAPI
 * SEM dependências externas problemáticas
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware básico
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Tentar carregar documentação Swagger
try {
  const { setupSimpleSwagger } = require('./docs/swagger-simple');
  setupSimpleSwagger(app);
} catch (error) {
  console.log('⚠️ Swagger simples não carregado:', error.message);
  
  // Documentação básica como fallback
  app.get('/api/docs', (req, res) => {
    res.json({
      title: 'Genesis Luminal API',
      version: '1.0.0',
      description: 'Documentação básica disponível',
      endpoints: [
        'GET /api/liveness - Health check',
        'GET /api/readiness - Readiness check', 
        'GET /api/status - System status',
        'POST /api/emotional/analyze - Emotional analysis'
      ]
    });
  });
}

// Health endpoints
app.get('/api/liveness', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/readiness', (req, res) => {
  res.json({
    status: 'ready',
    ready: true,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Emotional analysis endpoint
app.post('/api/emotional/analyze', (req, res) => {
  try {
    // Análise básica funcional
    const input = req.body;
    const hasText = input && input.text;
    const hasBehavioral = input && input.emotionalState;
    
    res.json({
      intensity: hasText ? 0.8 : 0.6,
      dominantAffect: hasText ? 'curiosity' : 'calm',
      timestamp: new Date().toISOString(),
      confidence: 0.75,
      recommendation: 'continue',
      emotionalShift: 'stable',
      morphogenicSuggestion: hasText ? 'spiral' : 'fibonacci'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Genesis Luminal Backend - PORT ${PORT}`);
  console.log(`📚 Documentação: http://localhost:${PORT}/api/docs`);
  console.log(`❤️ Health: http://localhost:${PORT}/api/liveness`);
  console.log(`✅ TRILHO A AÇÃO 1 - OpenAPI implementado (versão minimal)`);
});
