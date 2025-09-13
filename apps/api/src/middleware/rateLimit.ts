import type { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60_000);
const MAX_POINTS = Number(process.env.RATE_LIMIT_MAX ?? 100);

const durationSecRaw = WINDOW_MS / 1000;
const durationSec = Number.isFinite(durationSecRaw) ? Math.max(1, Math.floor(durationSecRaw)) : 900;

const limiter = new RateLimiterMemory({
  points: Number.isFinite(MAX_POINTS) ? MAX_POINTS : 100,
  duration: durationSec,
  blockDuration: durationSec,
});

function clientKey(req: Request): string {
  const xf = req.headers['x-forwarded-for'];
  const xfFirst = Array.isArray(xf)
    ? xf[0]
    : (typeof xf === 'string' ? xf.split(',')[0] : undefined);
  const ip = req.ip ?? xfFirst ?? (req.socket as any)?.remoteAddress ?? 'unknown';
  return String(ip).trim();
}

export async function rateLimit(req: Request, res: Response, next: NextFunction) {
  try {
    await limiter.consume(clientKey(req));
    return next();
  } catch (rejRes) {
    const msBeforeNext =
      (rejRes as { msBeforeNext?: number } | undefined)?.msBeforeNext ?? 60_000;
    const retryAfter = Math.max(1, Math.round(msBeforeNext / 1000));
    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({ message: 'Too Many Requests', retryAfter });
  }
}

// Mantém compatibilidade com index.ts que importa { rateLimitMiddleware }
export { rateLimit as rateLimitMiddleware };
export default rateLimit;
