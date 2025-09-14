/**
 * Cache Service - TRILHO B Ação 6
 * Service com optional Redis e logger correto
 */

import { createClient, RedisClientType } from 'redis';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

export class CacheService {
  private client?: RedisClientType;
  private memoryCache = new Map<string, any>();
  private useRedis = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      // ✅ Usar optional REDIS_URL
      if (config.REDIS_URL) {
        this.client = createClient({ url: config.REDIS_URL });
        await this.client.connect();
        this.useRedis = true;
        logger.info('Redis cache initialized');
      } else {
        logger.info('Using memory cache (Redis not configured)');
      }
    } catch (error) {
      logger.warn('Redis not available, using memory cache:', error);
      this.useRedis = false;
    }
  }

  async get(key: string): Promise<any> {
    try {
      if (this.useRedis && this.client) {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      }
      return this.memoryCache.get(key) || null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      if (this.useRedis && this.client) {
        await this.client.setEx(key, ttl, JSON.stringify(value));
      } else {
        this.memoryCache.set(key, value);
        setTimeout(() => this.memoryCache.delete(key), ttl * 1000);
      }
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      if (this.useRedis && this.client) {
        return await this.client.exists(key) === 1;
      }
      return this.memoryCache.has(key);
    } catch (error) {
      logger.error('Cache has error:', error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.useRedis && this.client) {
        await this.client.flushAll();
      }
      this.memoryCache.clear();
    } catch (error) {
      logger.error('Cache clear error:', error);
    }
  }
}
