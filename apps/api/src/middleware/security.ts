/**
 * GENESIS LUMINAL - MIDDLEWARE DE SEGURANÇA OWASP
 * Implementação de baseline de segurança seguindo OWASP Top 10
 */

import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

// ========================================
// CORS RESTRITO POR AMBIENTE
// ========================================

const getAllowedOrigins = (): string[] => {
  const origins = [];
  
  // Ambiente de desenvolvimento
  if (config.NODE_ENV === 'development') {
    origins.push('http://localhost:3000');
    origins.push('http://127.0.0.1:3000');
    origins.push('http://localhost:5173'); // Vite dev server
    origins.push('http://127.0.0.1:5173');
  }
  
  // Ambiente de produção
  if (config.NODE_ENV === 'production') {
    if (config.FRONTEND_URL) {
      origins.push(config.FRONTEND_URL);
    }
    // Adicionar domínios de produção específicos
    origins.push('https://genesisluminal.com');
    origins.push('https://www.genesisluminal.com');
  }
  
  // Ambiente de staging
  if (config.NODE_ENV === 'staging') {
    origins.push('https://staging.genesisluminal.com');
    if (config.FRONTEND_URL) {
      origins.push(config.FRONTEND_URL);
    }
  }
  
  return origins;
};

export const corsConfig = cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Permitir requests sem origin (mobile apps, Postman, etc.) apenas em dev
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
  maxAge: 86400 // 24 horas
});

// ========================================
// HELMET CONFIGURAÇÃO AVANÇADA
// ========================================

export const helmetConfig = helmet({
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
  crossOriginEmbedderPolicy: false, // Para compatibilidade com alguns navegadores
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// ========================================
// RATE LIMITING GRANULAR POR ROTA
// ========================================

// Rate limit geral (aplicado a todas as rotas exceto health)
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP por janela
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pular rate limit para health endpoints
    return req.path.startsWith('/api/liveness') || 
           req.path.startsWith('/api/readiness') || 
           req.path.startsWith('/api/status');
  }
});

// Rate limit específico para endpoints sensíveis
export const emotionalAnalysisRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // 30 análises por minuto
  message: {
    error: 'Muitas análises emocionais. Aguarde 1 minuto.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Slow down para endpoints computacionalmente intensivos
export const emotionalAnalysisSlowDown = slowDown({
  windowMs: 1 * 60 * 1000, // 1 minuto
  delayAfter: 10, // Permitir 10 requests normais
  delayMs: 500, // Adicionar 500ms de delay após o limite
  maxDelayMs: 5000 // Máximo de 5 segundos de delay
});

// Rate limit rigoroso para endpoints administrativos/críticos
export const strictRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 requests por hora
  message: {
    error: 'Limite de tentativas excedido para endpoint crítico.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ========================================
// MIDDLEWARE DE SEGURANÇA ADICIONAL
// ========================================

// Middleware para log de requests suspeitos
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /\.\./g, // Path traversal
    /<script/gi, // XSS
    /union.*select/gi, // SQL injection
    /javascript:/gi, // JavaScript injection
    /vbscript:/gi // VBScript injection
  ];
  
  const url = req.url.toLowerCase();
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const body = JSON.stringify(req.body || {}).toLowerCase();
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(userAgent) || pattern.test(body)
  );
  
  if (isSuspicious) {
    logger.warn('Request suspeito detectado', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.headers['user-agent'],
      body: req.body
    });
  }
  
  next();
};

// Middleware para limitar tamanho de payload
export const payloadSizeLimit = (maxSize: string = '1mb') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSizeBytes = maxSize === '1mb' ? 1024 * 1024 : parseInt(maxSize);
    
    if (contentLength > maxSizeBytes) {
      return res.status(413).json({
        error: 'Payload muito grande',
        maxSize: maxSize
      });
    }
    
    next();
  };
};

// ========================================
// EXPORTAÇÕES
// ========================================

export default {
  corsConfig,
  helmetConfig,
  generalRateLimit,
  emotionalAnalysisRateLimit,
  emotionalAnalysisSlowDown,
  strictRateLimit,
  securityLogger,
  payloadSizeLimit
};
