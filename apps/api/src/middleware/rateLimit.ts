/**
 * GENESIS LUMINAL - RATE LIMITING GRANULAR ATUALIZADO
 * Rate limiting com configuração granular por rota
 */

import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { logger } from '../utils/logger';

// ========================================
// CONFIGURAÇÃO DE RATE LIMITERS
// ========================================

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
const MAX_POINTS = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);

const durationSecRaw = WINDOW_MS / 1000;
const durationSec = Number.isFinite(durationSecRaw) ? Math.max(1, Math.floor(durationSecRaw)) : 900;

// Rate limiter geral
const generalLimiter = new RateLimiterMemory({
  points: Number.isFinite(MAX_POINTS) ? MAX_POINTS : 100,
  duration: durationSec,
  blockDuration: durationSec,
});

// Rate limiter para análise emocional (mais restritivo)
const emotionalLimiter = new RateLimiterMemory({
  points: 30, // 30 requests por minuto
  duration: 60, // 1 minuto
  blockDuration: 60,
});

// Rate limiter para endpoints críticos
const strictLimiter = new RateLimiterMemory({
  points: 10, // 10 requests por hora
  duration: 3600, // 1 hora
  blockDuration: 3600,
});

// ========================================
// UTILITÁRIOS
// ========================================

function clientKey(req: Request): string {
  const xf = req.headers['x-forwarded-for'];
  const xfFirst = Array.isArray(xf)
    ? xf[0]
    : (typeof xf === 'string' ? xf.split(',')[0] : undefined);
  const ip = req.ip ?? xfFirst ?? (req.socket as any)?.remoteAddress ?? 'unknown';
  return String(ip).trim();
}

function isHealthEndpoint(req: Request): boolean {
  return req.path.startsWith('/api/liveness') ||
         req.path.startsWith('/api/readiness') ||
         req.path.startsWith('/api/status');
}

function isEmotionalEndpoint(req: Request): boolean {
  return req.path.includes('/emotional');
}

function isCriticalEndpoint(req: Request): boolean {
  // Definir endpoints críticos que precisam de rate limiting rigoroso
  const criticalPaths = [
    '/api/admin',
    '/api/config',
    '/api/system'
  ];
  
  return criticalPaths.some(path => req.path.startsWith(path));
}

// ========================================
// MIDDLEWARE DE RATE LIMITING
// ========================================

export async function rateLimit(req: Request, res: Response, next: NextFunction) {
  try {
    // Pular rate limiting para health endpoints
    if (isHealthEndpoint(req)) {
      return next();
    }

    const clientId = clientKey(req);
    let limiter = generalLimiter;
    let rateLimitType = 'general';

    // Selecionar limiter apropriado baseado na rota
    if (isCriticalEndpoint(req)) {
      limiter = strictLimiter;
      rateLimitType = 'strict';
    } else if (isEmotionalEndpoint(req)) {
      limiter = emotionalLimiter;
      rateLimitType = 'emotional';
    }

    await limiter.consume(clientId);

    // Adicionar headers informativos
    const resRateLimiter = await limiter.get(clientId);
    if (resRateLimiter) {
      res.setHeader('X-Rate-Limit-Limit', limiter.points);
      res.setHeader('X-Rate-Limit-Remaining', resRateLimiter.remainingHits || 0);
      res.setHeader('X-Rate-Limit-Reset', new Date(Date.now() + resRateLimiter.msBeforeNext));
    }

    logger.debug('Rate limit aplicado', {
      clientId,
      path: req.path,
      type: rateLimitType,
      remaining: resRateLimiter?.remainingHits || 0
    });

    return next();
  } catch (rejRes: any) {
    const msBeforeNext = rejRes?.msBeforeNext ?? 60_000;
    const retryAfter = Math.max(1, Math.round(msBeforeNext / 1000));
    
    res.setHeader('Retry-After', String(retryAfter));
    res.setHeader('X-Rate-Limit-Limit', rejRes?.totalHits ?? 0);
    res.setHeader('X-Rate-Limit-Remaining', 0);
    res.setHeader('X-Rate-Limit-Reset', new Date(Date.now() + msBeforeNext));

    logger.warn('Rate limit excedido', {
      clientId: clientKey(req),
      path: req.path,
      retryAfter,
      msBeforeNext
    });

    return res.status(429).json({
      error: 'Muitas tentativas',
      message: `Rate limit excedido. Tente novamente em ${retryAfter} segundos.`,
      retryAfter: retryAfter,
      timestamp: new Date().toISOString()
    });
  }
}

// Mantém compatibilidade com código existente
export { rateLimit as rateLimitMiddleware };
export default rateLimit;
