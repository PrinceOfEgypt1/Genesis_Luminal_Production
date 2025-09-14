/**
 * TRILHO B AÇÃO 6 - Rate Limit Middleware Integrado
 * 
 * Middleware Express que integra IRateLimiter com proteção de health endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { IRateLimiter, IRateLimitConfig } from '../interfaces/IRateLimiter';
import { IClientKeyExtractor } from '../interfaces/IRateLimiter';
import { ExpressClientKeyExtractor } from '../rateLimit/ClientKeyExtractor';
import { createMemoryRateLimiter } from '../rateLimit/MemoryRateLimiter';
import { logger } from '../../utils/logger';

export interface IRateLimitMiddlewareConfig extends IRateLimitConfig {
  /** Rotas que devem ser excluídas do rate limiting */
  excludePaths?: string[];
  /** Headers customizados para rate limit info */
  includeHeaders?: boolean;
  /** Função customizada para determinar se aplicar rate limit */
  shouldApplyRateLimit?: (req: Request) => boolean;
}

export class RateLimitMiddleware {
  private rateLimiter: IRateLimiter;
  private keyExtractor: IClientKeyExtractor;
  private config: IRateLimitMiddlewareConfig;

  constructor(
    rateLimiter?: IRateLimiter,
    keyExtractor?: IClientKeyExtractor,
    config?: Partial<IRateLimitMiddlewareConfig>
  ) {
    this.rateLimiter = rateLimiter || createMemoryRateLimiter();
    this.keyExtractor = keyExtractor || new ExpressClientKeyExtractor();
    
    this.config = {
      maxRequests: 100,
      windowSeconds: 900, // 15 minutos
      blockDurationSeconds: 900,
      excludePaths: [
        '/api/liveness',
        '/api/readiness', 
        '/api/health',
        '/api/status'
      ],
      includeHeaders: true,
      ...config
    };

    logger.info('RateLimitMiddleware initialized', {
      maxRequests: this.config.maxRequests,
      windowSeconds: this.config.windowSeconds,
      excludePaths: this.config.excludePaths
    });
  }

  /**
   * Middleware Express para rate limiting
   */
  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Verificar se deve aplicar rate limiting
        if (!this.shouldApplyToRequest(req)) {
          return next();
        }

        const clientKey = this.keyExtractor.extractKey(req);
        const result = await this.rateLimiter.consume(clientKey, this.config);

        // Adicionar headers informativos
        if (this.config.includeHeaders) {
          res.setHeader('X-RateLimit-Limit', this.config.maxRequests);
          res.setHeader('X-RateLimit-Remaining', result.remaining);
          res.setHeader('X-RateLimit-Reset', Date.now() + (result.resetTime * 1000));
        }

        if (!result.allowed) {
          if (result.retryAfter) {
            res.setHeader('Retry-After', result.retryAfter);
          }

          logger.warn('Rate limit exceeded', {
            clientKey,
            path: req.path,
            method: req.method,
            userAgent: req.get('User-Agent'),
            retryAfter: result.retryAfter
          });

          return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: result.retryAfter || this.config.blockDurationSeconds,
            limit: this.config.maxRequests,
            windowSeconds: this.config.windowSeconds
          });
        }

        next();
      } catch (error) {
        logger.error('Rate limit middleware error', { 
          error: (error as Error).message,
          path: req.path 
        });
        
        // Em caso de erro, permitir a request (fail-open)
        next();
      }
    };
  }

  /**
   * Middleware específico para proteção de endpoints críticos
   */
  strictMiddleware(config?: Partial<IRateLimitConfig>) {
    const strictConfig = {
      maxRequests: 10,
      windowSeconds: 60,
      blockDurationSeconds: 300,
      ...config
    };

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const clientKey = this.keyExtractor.extractKey(req);
        const result = await this.rateLimiter.consume(clientKey, strictConfig);

        if (!result.allowed) {
          logger.warn('Strict rate limit exceeded', {
            clientKey,
            path: req.path,
            method: req.method
          });

          return res.status(429).json({
            error: 'Rate Limit Exceeded',
            message: 'Too many requests to sensitive endpoint',
            retryAfter: result.retryAfter || strictConfig.blockDurationSeconds
          });
        }

        next();
      } catch (error) {
        logger.error('Strict rate limit middleware error', { error });
        next();
      }
    };
  }

  private shouldApplyToRequest(req: Request): boolean {
    // Verificar paths excluídos
    if (this.config.excludePaths?.some(path => req.path.startsWith(path))) {
      return false;
    }

    // Função customizada de verificação
    if (this.config.shouldApplyRateLimit) {
      return this.config.shouldApplyRateLimit(req);
    }

    return true;
  }

  /**
   * Obtém estatísticas do rate limiter
   */
  async getStats() {
    return await this.rateLimiter.getStats();
  }

  /**
   * Reset manual para uma chave específica
   */
  async resetClient(req: Request) {
    const clientKey = this.keyExtractor.extractKey(req);
    await this.rateLimiter.reset(clientKey);
    logger.info('Rate limit reset for client', { clientKey });
  }
}

// Factory function com configuração padrão
export function createRateLimitMiddleware(
  config?: Partial<IRateLimitMiddlewareConfig>
): RateLimitMiddleware {
  const rateLimiter = createMemoryRateLimiter({
    maxRequests: config?.maxRequests || 100,
    windowSeconds: config?.windowSeconds || 900,
    blockDurationSeconds: config?.blockDurationSeconds || 900
  });

  return new RateLimitMiddleware(rateLimiter, undefined, config);
}
