import { sanitizeEmotional } from './middleware/sanitizeEmotional';
/**
 * GENESIS LUMINAL BACKEND
 * Servidor principal com integração Claude API
 * CORREÇÃO: Rate limit aplicado APÓS rotas de saúde
 * VERSÃO: 2.0 - Com baseline segurança OWASP
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
import { logger } from './utils/logger';

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
    
    // Ambiente de desenvolvimento
    if (config.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000');
      allowedOrigins.push('http://127.0.0.1:3000');
      allowedOrigins.push('http://localhost:5173');
      allowedOrigins.push('http://127.0.0.1:5173');
    }
    
    // Ambiente de produção
    if (config.NODE_ENV === 'production') {
      if (config.FRONTEND_URL) {
        allowedOrigins.push(config.FRONTEND_URL);
      }
    }
    
    // Permitir requests sem origin em desenvolvimento
    if (!origin && config.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS: Origin ${origin} não permitida`, { 
        origin, 
        allowedOrigins,
        env: config.NODE_ENV 
      });
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

// Body parsing com limite reduzido
app.use(express.json({ limit: '1mb' }));
app.use('/api/emotional/analyze', sanitizeEmotional);
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ✅ CORREÇÃO CRÍTICA: Health routes ANTES do rate limiting
app.use('/api', healthRouter);

// ✅ Rate limiting aplicado APÓS rotas de saúde
app.use(rateLimitMiddleware);

// Application routes
app.use('/api', setupRoutes());

// Error handling
app.use(errorMiddleware);

// Start server
const PORT = config.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`🛡️ Genesis Luminal Backend running on port ${PORT}`);
  logger.info(`🔡 Frontend URL: ${config.FRONTEND_URL}`);
  logger.info(`🧠 Claude API: ${config.CLAUDE_API_KEY ? 'Configured' : 'Missing'}`);
  logger.info(`⏱️ Request timeout: ${REQUEST_TIMEOUT_MS}ms`);
  logger.info(`🛡️ Health endpoints: /api/liveness, /api/readiness, /api/status`);
  logger.info(`✅ OWASP Security: CORS restrito, Helmet CSP, Rate limiting granular`);
  logger.info(`🔒 Security Features: Environment-based CORS, Advanced CSP, Granular rate limits`);
});

export default app;
