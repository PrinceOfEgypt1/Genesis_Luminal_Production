/**
 * TRILHO B AÇÃO 6 - Cache Service Refatorado
 * 
 * Implementação em memória do ICacheService
 * Separação clara de responsabilidades de infraestrutura
 */

import { ICacheService, ICacheEntry } from '../interfaces/ICacheService';
import { logger } from '../../utils/logger';

export class InMemoryCacheService implements ICacheService {
  private cache = new Map<string, ICacheEntry>();
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };

  constructor(
    private readonly defaultTtlSeconds: number = 300,
    private readonly maxSize: number = 1000,
    private readonly cleanupIntervalMs: number = 60000
  ) {
    this.startCleanupInterval();
    logger.info('InMemoryCacheService initialized', {
      defaultTtl: defaultTtlSeconds,
      maxSize,
      cleanupInterval: cleanupIntervalMs
    });
  }

  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Verificar se expirou
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.value as T;
  }

  async set<T = any>(key: string, value: T, ttlSeconds: number = this.defaultTtlSeconds): Promise<void> {
    // Limitar tamanho do cache
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      await this.evictOldest();
    }

    const entry: ICacheEntry<T> = {
      value,
      ttl: ttlSeconds * 1000, // Converter para milliseconds
      createdAt: Date.now()
    };

    this.cache.set(key, entry);
    this.stats.sets++;
    
    logger.debug('Cache entry set', { key, ttl: ttlSeconds });
  }

  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      logger.debug('Cache entry deleted', { key });
    }
    return deleted;
  }

  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    logger.info('Cache cleared', { previousSize: size });
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  async getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: parseFloat(hitRate.toFixed(3))
    };
  }

  async isHealthy(): Promise<boolean> {
    try {
      // Teste básico de funcionamento
      const testKey = '__health_check__';
      await this.set(testKey, 'test', 1);
      const value = await this.get(testKey);
      await this.delete(testKey);
      
      return value === 'test';
    } catch (error) {
      logger.error('Cache health check failed', { error });
      return false;
    }
  }

  private isExpired(entry: ICacheEntry): boolean {
    return Date.now() - entry.createdAt > entry.ttl;
  }

  private async evictOldest(): Promise<void> {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      await this.delete(oldestKey);
      logger.debug('Cache eviction performed', { evictedKey: oldestKey });
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupIntervalMs);
  }

  private cleanup(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.createdAt > entry.ttl) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      logger.debug('Cache cleanup completed', { 
        expiredEntries: expiredCount,
        remainingEntries: this.cache.size 
      });
    }
  }
}

// Factory function para facilitar instanciação
export function createInMemoryCacheService(
  ttlSeconds = 300,
  maxSize = 1000,
  cleanupIntervalMs = 60000
): ICacheService {
  return new InMemoryCacheService(ttlSeconds, maxSize, cleanupIntervalMs);
}
