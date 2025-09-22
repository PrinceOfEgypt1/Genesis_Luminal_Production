/**
 * @fileoverview Rate limiting middleware
 * @version 1.0.0
 */

import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

/**
 * Rate limiting configuration for different endpoint types
 */
const rateLimitConfigs = {
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many API requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
    message: 'Too many authentication attempts from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  health: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // health checks can be more frequent
    message: 'Too many health check requests from this IP.',
    standardHeaders: true,
    legacyHeaders: false,
  },
};

/**
 * Create rate limiter with custom configuration
 */
export const createRateLimiter = (type: keyof typeof rateLimitConfigs) => {
  const config = rateLimitConfigs[type];
  
  return rateLimit({
    ...config,
    handler: (req: Request, res: Response) => {
      // Add rate limit info to request for logging
      (req as any).rateLimit = {
        type,
        limit: config.max,
        windowMs: config.windowMs,
        remaining: 0
      };
      
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: config.message,
        retryAfter: Math.ceil(config.windowMs / 1000)
      });
    }
  });
};

/**
 * Rate limiters for different endpoint types
 */
export const apiRateLimit = createRateLimiter('api');
export const authRateLimit = createRateLimiter('auth');
export const healthRateLimit = createRateLimiter('health');

/**
 * Middleware to add rate limit info to successful requests
 */
export const addRateLimitInfo = (req: Request, res: Response, next: NextFunction) => {
  // Add rate limit information to response headers
  res.on('finish', () => {
    if ((req as any).rateLimit) {
      const info = (req as any).rateLimit;
      console.log(`Rate limit info: ${info.type} endpoint accessed`, {
        ip: req.ip,
        limit: info.limit,
        remaining: info.remaining
      });
    }
  });
  
  next();
};

export default {
  apiRateLimit,
  authRateLimit,
  healthRateLimit,
  addRateLimitInfo,
  createRateLimiter
};
