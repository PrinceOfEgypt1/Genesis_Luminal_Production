/**
 * GENESIS LUMINAL - RATE LIMITING GRANULAR OWASP
 * Sistema avançado de rate limiting por tipo de rota
 * Implementa proteção contra ataques de DDoS e abuse
 */

import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { RATE_LIMITS, ROUTE_RATE_MAPPING } from '../config/security';
import { logger } from '../utils/logger';

/**
 * INSTÂNCIAS DE RATE LIMITER POR TIPO
 */
const rateLimiters = {
  strict: new RateLimiterMemory({
    points: RATE_LIMITS.strict.maxRequests,
    duration: Math.ceil(RATE_LIMITS.strict.windowMs / 1000),
    blockDuration: Math.ceil(RATE_LIMITS.strict.blockDuration / 1000),
  }),
  
  normal: new RateLimiterMemory({
    points: RATE_LIMITS.normal.maxRequests,
    duration: Math.ceil(RATE_LIMITS.normal.windowMs / 1000),
    blockDuration: Math.ceil(RATE_LIMITS.normal.blockDuration / 1000),
  }),
  
  heavy: new RateLimiterMemory({
    points: RATE_LIMITS.heavy.maxRequests,
    duration: Math.ceil(RATE_LIMITS.heavy.windowMs / 1000),
    blockDuration: Math.ceil(RATE_LIMITS.heavy.blockDuration / 1000),
  }),
  
  health: new RateLimiterMemory({
    points: RATE_LIMITS.health.maxRequests,
    duration: Math.ceil(RATE_LIMITS.health.windowMs / 1000),
    blockDuration: Math.ceil(RATE_LIMITS.health.blockDuration / 1000),
  })
};

/**
 * FUNÇÃO PARA OBTER CHAVE ÚNICA DO CLIENT
 * Considera IP, User-Agent e outros fatores para identificação
 */
function getClientKey(req: Request): string {
  // Obter IP real (considera proxies e load balancers)
  const xForwardedFor = req.headers['x-forwarded-for'];
  let clientIp = req.ip;
  
  if (Array.isArray(xForwardedFor)) {
    clientIp = xForwardedFor[0];
  } else if (typeof xForwardedFor === 'string') {
    clientIp = xForwardedFor.split(',')[0];
  }
  
  clientIp = clientIp || req.socket?.remoteAddress || 'unknown';
  
  // Adicionar User-Agent para melhor identificação (previne bypass simples de IP)
  const userAgent = req.get('User-Agent') || 'unknown';
  const userAgentHash = Buffer.from(userAgent).toString('base64').substring(0, 16);
  
  return `${String(clientIp).trim()}:${userAgentHash}`;
}

/**
 * FUNÇÃO PARA DETERMINAR TIPO DE RATE LIMIT DA ROTA
 */
function getRateLimitType(path: string): keyof typeof RATE_LIMITS {
  for (const mapping of ROUTE_RATE_MAPPING) {
    if (mapping.pattern.test(path)) {
      return mapping.limit;
    }
  }
  return 'normal'; // fallback
}

/**
 * MIDDLEWARE DE RATE LIMITING GRANULAR
 * Aplica diferentes limites baseado no tipo de endpoint
 */
export async function granularRateLimit(req: Request, res: Response, next: NextFunction) {
  try {
    const rateLimitType = getRateLimitType(req.path);
    const limiter = rateLimiters[rateLimitType];
    const clientKey = getClientKey(req);

    // Log de tentativa de acesso
    logger.debug('Rate limit check', {
      type: 'rate_limit_check',
      path: req.path,
      method: req.method,
      rateLimitType,
      clientKey: clientKey.substring(0, 16) + '...', // Log parcial por privacidade
      timestamp: new Date().toISOString()
    });

    // Verificar rate limit
    const resRateLimit = await limiter.consume(clientKey);
    
    // Adicionar headers informativos
    res.setHeader('X-RateLimit-Limit', RATE_LIMITS[rateLimitType].maxRequests);
    res.setHeader('X-RateLimit-Remaining', resRateLimit.remainingPoints || 0);
    res.setHeader('X-RateLimit-Reset', new Date(Date.now() + resRateLimit.msBeforeNext || 0).toISOString());
    res.setHeader('X-RateLimit-Type', rateLimitType);

    next();
    
  } catch (rejRes: any) {
    // Rate limit excedido
    const rateLimitType = getRateLimitType(req.path);
    const msBeforeNext = rejRes?.msBeforeNext || RATE_LIMITS[rateLimitType].blockDuration;
    const retryAfterSeconds = Math.max(1, Math.ceil(msBeforeNext / 1000));

    // Log de violação de rate limit
    logger.warn('Rate limit exceeded', {
      type: 'rate_limit_violation',
      path: req.path,
      method: req.method,
      rateLimitType,
      clientKey: getClientKey(req).substring(0, 16) + '...',
      retryAfterSeconds,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    // Headers de resposta
    res.setHeader('Retry-After', retryAfterSeconds);
    res.setHeader('X-RateLimit-Limit', RATE_LIMITS[rateLimitType].maxRequests);
    res.setHeader('X-RateLimit-Remaining', 0);
    res.setHeader('X-RateLimit-Reset', new Date(Date.now() + msBeforeNext).toISOString());
    res.setHeader('X-RateLimit-Type', rateLimitType);

    // Resposta de erro personalizada baseada no tipo
    const errorMessages = {
      strict: 'Authentication endpoint rate limit exceeded. Please wait before trying again.',
      heavy: 'AI processing endpoint temporarily overloaded. Please reduce request frequency.',
      normal: 'API rate limit exceeded. Please wait before making more requests.',
      health: 'Monitoring endpoint rate limit exceeded.' // Não deve acontecer com limites altos
    };

    return res.status(429).json({
      error: 'Too Many Requests',
      message: errorMessages[rateLimitType],
      retryAfter: retryAfterSeconds,
      type: rateLimitType,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * MIDDLEWARE ESPECÍFICO PARA HEALTH CHECKS
 * Sem rate limiting para endpoints críticos de monitoring
 */
export function healthCheckRateLimit(req: Request, res: Response, next: NextFunction) {
  // Health checks passam direto sem limitação
  // Apenas log para auditoria
  logger.debug('Health check access', {
    type: 'health_check',
    path: req.path,
    method: req.method,
    ip: getClientKey(req).split(':')[0],
    timestamp: new Date().toISOString()
  });
  
  next();
}

/**
 * MIDDLEWARE DE RATE LIMITING ADAPTATIVO
 * Ajusta limites baseado na carga do sistema
 */
export function adaptiveRateLimit(req: Request, res: Response, next: NextFunction) {
  // Para implementação futura: ajustar rate limits baseado em:
  // - CPU usage
  // - Memory usage  
  // - Response times
  // - Error rates
  
  // Por enquanto, usar o rate limiting granular padrão
  return granularRateLimit(req, res, next);
}

// Compatibilidade com código existente
export { granularRateLimit as rateLimitMiddleware };
export { granularRateLimit as rateLimit };
export default granularRateLimit;
