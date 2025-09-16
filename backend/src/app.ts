/**
 * GENESIS LUMINAL - APP CONFIGURATION
 * Apenas configuração do Express, sem inicialização do servidor
 * Para uso em testes e desenvolvimento
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/environment';
import { setupRoutes } from './routes';
import { healthRouter } from './routes/health';
import { errorMiddleware } from './middleware/error';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { sanitizeEmotional } from './middleware/sanitizeEmotional';

const app = express();

// Timeout configurável
const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || '15000', 10);

// Middleware de timeout
app.use((req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({
        error: 'Request timeout',
        message: `Request exceeded ${REQUEST_TIMEOUT_MS}ms limit`,
        timestamp: new Date().toISOString()
      });
    }
  }, REQUEST_TIMEOUT_MS);

  res.on('finish', () => clearTimeout(timeout));
  res.on('close', () => clearTimeout(timeout));
  
  next();
});

// Security & Performance middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression());

// CORS restrito por ambiente
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [];
    
    if (config.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000');
      allowedOrigins.push('http://127.0.0.1:3000');
      allowedOrigins.push('http://localhost:5173');
      allowedOrigins.push('http://127.0.0.1:5173');
    }
    
    if (config.NODE_ENV === 'production') {
      if (config.FRONTEND_URL) {
        allowedOrigins.push(config.FRONTEND_URL);
      }
    }
    
    if (!origin && config.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Limit', 'X-Rate-Limit-Remaining'],
  maxAge: 86400
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use('/api/emotional/analyze', sanitizeEmotional);
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health routes ANTES do rate limiting
app.use('/api', healthRouter);

// Rate limiting aplicado APÓS rotas de saúde
app.use(rateLimitMiddleware);

// Application routes
app.use('/api', setupRoutes());

// Error handling
app.use(errorMiddleware);

export default app;
