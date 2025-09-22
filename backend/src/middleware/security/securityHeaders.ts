/**
 * @fileoverview Enterprise Security Headers
 * @version 1.0.0
 */

import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

/**
 * Enterprise-grade security headers
 */
export const enterpriseSecurityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.anthropic.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'"]
    }
  },

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },

  // X-Frame-Options
  frameguard: {
    action: 'deny'
  },

  // X-Content-Type-Options
  noSniff: true,

  // X-XSS-Protection
  xssFilter: true,

  // Referrer Policy
  referrerPolicy: {
    policy: ['no-referrer-when-downgrade']
  },

  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: {
    policy: 'cross-origin'
  },

  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: {
    policy: 'same-origin-allow-popups'
  },

  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false,

  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false
  },

  // Hide Powered By
  hidePoweredBy: true
});

/**
 * Additional custom security headers
 */
export const customSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Security headers
  res.setHeader('X-Security-Policy', 'Genesis-Luminal-Enterprise');
  res.setHeader('X-Content-Security-Policy', 'default-src self');
  res.setHeader('X-WebKit-CSP', 'default-src self');
  
  // API versioning and rate limit info
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-Rate-Limit-Policy', 'Tiered');
  
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  next();
};

/**
 * Security audit middleware
 */
export const securityAudit = (req: Request, res: Response, next: NextFunction) => {
  // Log security-relevant events
  const securityEvent = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    path: req.path,
    method: req.method,
    headers: {
      authorization: !!req.get('Authorization'),
      origin: req.get('Origin'),
      referer: req.get('Referer')
    }
  };

  // Log suspicious patterns
  if (req.path.includes('../') || req.path.includes('..\\')) {
    console.warn('🚨 SECURITY: Path traversal attempt detected', securityEvent);
  }

  if (req.get('User-Agent')?.includes('curl') || req.get('User-Agent')?.includes('wget')) {
    console.log('🔍 SECURITY: CLI tool access detected', securityEvent);
  }

  next();
};

export default {
  enterpriseSecurityHeaders,
  customSecurityHeaders,
  securityAudit
};
