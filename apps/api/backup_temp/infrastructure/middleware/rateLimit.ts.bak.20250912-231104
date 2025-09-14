/**
 * Middleware de rate limiting
 */

import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';

const rateLimiter = new RateLimiterMemory({
  keyPath: 'ip',
  points: config.RATE_LIMIT_MAX,
  duration: config.RATE_LIMIT_WINDOW_MS / 1000,
});

export async function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
}
