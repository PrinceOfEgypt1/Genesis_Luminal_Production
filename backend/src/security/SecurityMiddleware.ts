/**
 * @fileoverview Security Middleware Básico e Seguro
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

import { Request, Response, NextFunction } from 'express';
import { rateLimitMiddleware } from './RateLimiter';

export class BasicSecurityMiddleware {
  
  // Headers básicos de segurança
  securityHeaders(req: Request, res: Response, next: NextFunction) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    }
    
    next();
  }

  // Log básico de requests
  requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, path, ip } = req;
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${method} ${path} - ${res.statusCode} - ${ip} - ${duration}ms`);
    });
    
    next();
  }

  // Input básico sanitization
  basicSanitization(req: Request, res: Response, next: NextFunction) {
    if (req.body && typeof req.body === 'object') {
      req.body = this.sanitizeObject(req.body);
    }
    
    if (req.query && typeof req.query === 'object') {
      req.query = this.sanitizeObject(req.query);
    }
    
    next();
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Sanitização básica - remover scripts
        sanitized[key] = value.replace(/<script[^>]*>.*?<\/script>/gi, '');
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  // Aplicar todos os middlewares
  applyBasicSecurity(app: any) {
    console.log('🔒 Aplicando segurança básica...');
    
    app.use(this.requestLogger);
    app.use(this.securityHeaders);
    app.use(this.basicSanitization);
    app.use(rateLimitMiddleware);
    
    console.log('✅ Segurança básica aplicada');
  }
}

export const securityMiddleware = new BasicSecurityMiddleware();

export function applyBasicSecurity(app: any) {
  securityMiddleware.applyBasicSecurity(app);
}
