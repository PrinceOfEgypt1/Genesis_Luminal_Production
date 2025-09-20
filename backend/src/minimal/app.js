/**
 * Genesis Luminal - Sistema Mínimo Funcionando
 * Engenharia Sênior: Base estável sem complexidade desnecessária
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware básico e seguro
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging básico
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health check funcional
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    system: 'genesis-luminal-minimal',
    version: '1.0.0'
  });
});

// API Health específica
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      api: 'healthy',
      emotional_analysis: 'healthy'
    }
  });
});

// Análise emocional básica funcionando
app.post('/api/emotional/analyze', (req, res) => {
  try {
    const { text, userId } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Text is required and must be a string',
        timestamp: new Date().toISOString()
      });
    }
    
    if (text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Text cannot be empty',
        timestamp: new Date().toISOString()
      });
    }
    
    // Análise emocional mock baseada no texto
    const textLength = text.length;
    const intensity = Math.min(textLength / 100, 1.0);
    const positiveWords = ['good', 'great', 'happy', 'wonderful', 'amazing', 'love'];
    const negativeWords = ['bad', 'sad', 'angry', 'terrible', 'hate', 'awful'];
    
    const textLower = text.toLowerCase();
    const hasPositive = positiveWords.some(word => textLower.includes(word));
    const hasNegative = negativeWords.some(word => textLower.includes(word));
    
    let dominantAffect = 'neutral';
    if (hasPositive && !hasNegative) dominantAffect = 'joy';
    else if (hasNegative && !hasPositive) dominantAffect = 'sadness';
    else if (textLength > 50) dominantAffect = 'curiosity';
    
    const response = {
      intensity: intensity,
      dominantAffect: dominantAffect,
      confidence: 0.8,
      processingTime: Math.floor(Math.random() * 100) + 50,
      provider: 'minimal-system',
      recommendation: intensity > 0.7 ? 'continue' : 'adapt',
      timestamp: new Date().toISOString()
    };
    
    if (userId) {
      response.userId = userId;
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('Error in emotional analysis:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Error handler global
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.url,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Genesis Luminal Minimal System running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
