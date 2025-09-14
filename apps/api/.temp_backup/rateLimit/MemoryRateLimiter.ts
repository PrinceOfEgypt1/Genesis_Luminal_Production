/**
 * TRILHO B AÇÃO 6 - Memory Rate Limiter (MAP ITERATION CORRIGIDO)
 * 
 * Implementação em memória do IRateLimiter usando sliding window
 * Correção: Compatible Map iteration para targets < ES2015
 */

import { IRateLimiter, IRateLimitConfig, IRateLimitResult } from '../interfaces/IRateLimiter';
import { logger } from '../../utils/logger';

interface RateLimitEntry {
  requests: number[];
  blocked: boolean;
  blockUntil?: number;
}

export class MemoryRateLimiter implements IRateLimiter {
  private entries = new Map<string, RateLimitEntry>();
  private stats = {
    totalRequests: 0,
    blockedRequests: 0
  };

  private readonly defaultConfig: IRateLimitConfig = {
    maxRequests: 100,
    windowSeconds: 900,
    blockDurationSeconds: 900,
    identifier: 'default'
  };

  constructor(defaultConfig?: Partial<IRateLimitConfig>) {
    if (defaultConfig) {
      this.defaultConfig = { ...this.defaultConfig, ...defaultConfig };
    }

    setInterval(() => {
      this.cleanup();
    }, 60000);

    logger.info('MemoryRateLimiter initialized', { defaultConfig: this.defaultConfig });
  }

  async checkLimit(key: string, config?: Partial<IRateLimitConfig>): Promise<IRateLimitResult> {
    const effectiveConfig = { ...this.defaultConfig, ...config };
    const entry = this.getOrCreateEntry(key);
    
    if (entry.blocked && entry.blockUntil && Date.now() < entry.blockUntil) {
      const retryAfter = Math.ceil((entry.blockUntil - Date.now()) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: retryAfter,
        retryAfter
      };
    }

    const windowStart = Date.now() - (effectiveConfig.windowSeconds * 1000);
    entry.requests = entry.requests.filter(timestamp => timestamp > windowStart);
    
    if (entry.blocked && (!entry.blockUntil || Date.now() >= entry.blockUntil)) {
      entry.blocked = false;
      delete entry.blockUntil;
    }

    const currentRequests = entry.requests.length;
    const remaining = Math.max(0, effectiveConfig.maxRequests - currentRequests);
    const resetTime = Math.ceil(effectiveConfig.windowSeconds - 
      (Date.now() - (entry.requests[0] || Date.now())) / 1000);

    return {
      allowed: currentRequests < effectiveConfig.maxRequests,
      remaining,
      resetTime: Math.max(0, resetTime)
    };
  }

  async consume(key: string, config?: Partial<IRateLimitConfig>): Promise<IRateLimitResult> {
    const effectiveConfig = { ...this.defaultConfig, ...config };
    this.stats.totalRequests++;

    const limitResult = await this.checkLimit(key, config);

    if (!limitResult.allowed) {
      this.stats.blockedRequests++;
      return limitResult;
    }

    const entry = this.getOrCreateEntry(key);
    entry.requests.push(Date.now());

    if (entry.requests.length >= effectiveConfig.maxRequests) {
      entry.blocked = true;
      entry.blockUntil = Date.now() + (effectiveConfig.blockDurationSeconds * 1000);
      
      logger.debug('Rate limit exceeded, client blocked', {
        key,
        requests: entry.requests.length,
        maxRequests: effectiveConfig.maxRequests,
        blockDuration: effectiveConfig.blockDurationSeconds
      });
    }

    return {
      allowed: true,
      remaining: Math.max(0, effectiveConfig.maxRequests - entry.requests.length),
      resetTime: limitResult.resetTime
    };
  }

  async reset(key: string): Promise<void> {
    const entry = this.entries.get(key);
    if (entry) {
      entry.requests = [];
      entry.blocked = false;
      delete entry.blockUntil;
      logger.debug('Rate limit reset for key', { key });
    }
  }

  async getStats() {
    return {
      totalRequests: this.stats.totalRequests,
      blockedRequests: this.stats.blockedRequests,
      activeKeys: this.entries.size
    };
  }

  async isHealthy(): Promise<boolean> {
    try {
      const testKey = '__health_check__';
      const result = await this.checkLimit(testKey);
      return typeof result.allowed === 'boolean';
    } catch (error) {
      logger.error('Rate limiter health check failed', { error });
      return false;
    }
  }

  private getOrCreateEntry(key: string): RateLimitEntry {
    if (!this.entries.has(key)) {
      this.entries.set(key, {
        requests: [],
        blocked: false
      });
    }
    return this.entries.get(key)!;
  }

  private cleanup(): void {
    const now = Date.now();
    let cleanedEntries = 0;

    // CORREÇÃO: Usar Array.from() para compatibilidade
    const entries = Array.from(this.entries.entries());
    for (let i = 0; i < entries.length; i++) {
      const [key, entry] = entries[i];
      const hasRecentRequests = entry.requests.some(timestamp => 
        now - timestamp < 3600000
      );
      
      const isBlocked = entry.blocked && entry.blockUntil && now < entry.blockUntil;

      if (!hasRecentRequests && !isBlocked) {
        this.entries.delete(key);
        cleanedEntries++;
      }
    }

    if (cleanedEntries > 0) {
      logger.debug('Rate limiter cleanup completed', { 
        cleanedEntries,
        remainingEntries: this.entries.size 
      });
    }
  }
}

export function createMemoryRateLimiter(config?: Partial<IRateLimitConfig>): IRateLimiter {
  return new MemoryRateLimiter(config);
}
