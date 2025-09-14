/**
 * TRILHO B AÇÃO 6 - Cache Service Simplificado
 * 
 * Implementação funcional sem complexidade desnecessária
 */

import { logger } from '../../utils/logger';

export interface CacheEntry {
  value: any;
  expiry: number;
}

export class InMemoryCacheService {
  private cache = new Map<string, CacheEntry>();

  constructor(private defaultTtlSeconds = 300) {
    // Cleanup a cada minuto
    setInterval(() => this.cleanup(), 60000);
    logger.info('InMemoryCacheService initialized');
  }

  async get(key: string): Promise<any> {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  async set(key: string, value: any, ttlSeconds = this.defaultTtlSeconds): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.set('__health__', 'test', 1);
      const value = await this.get('__health__');
      await this.delete('__health__');
      return value === 'test';
    } catch {
      return false;
    }
  }

  private cleanup() {
    const now = Date.now();
    let expired = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        expired++;
      }
    }

    if (expired > 0) {
      logger.debug('Cache cleanup', { expiredEntries: expired });
    }
  }
}

export function createCacheService(ttlSeconds = 300) {
  return new InMemoryCacheService(ttlSeconds);
}
