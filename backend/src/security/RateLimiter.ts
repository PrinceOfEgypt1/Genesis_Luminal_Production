/**
 * @fileoverview Sistema de Rate Limiting Simplificado
 * @version 1.0.0  
 * @author Genesis Luminal Team
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipPaths: string[];
}

export class SimpleRateLimiter {
  private requests: Map<string, number[]>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.requests = new Map();
    this.config = config;
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Skip paths na whitelist
      if (this.config.skipPaths.some(path => req.path.startsWith(path))) {
        return next();
      }

      const clientId = req.ip || 'unknown';
      const now = Date.now();
      
      // Obter requests do cliente
      let clientRequests = this.requests.get(clientId) || [];
      
      // Filtrar requests dentro da janela
      clientRequests = clientRequests.filter(timestamp => 
        now - timestamp < this.config.windowMs
      );

      // Verificar limite
      if (clientRequests.length >= this.config.maxRequests) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(this.config.windowMs / 1000)
        });
      }

      // Adicionar request atual
      clientRequests.push(now);
      this.requests.set(clientId, clientRequests);

      next();
    };
  }

  getStats() {
    return {
      trackedIPs: this.requests.size,
      totalRequests: Array.from(this.requests.values()).reduce((sum, reqs) => sum + reqs.length, 0)
    };
  }
}

export const rateLimiter = new SimpleRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: process.env.NODE_ENV === 'development' ? 1000 : 100,
  skipPaths: ['/api/health', '/metrics', '/api-docs']
});

export const rateLimitMiddleware = rateLimiter.middleware();
