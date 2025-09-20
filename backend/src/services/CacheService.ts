/**
 * Serviço de cache com Redis
 */

import { createClient } from 'redis';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

export class CacheService {
  private client = createClient({ url: config.REDIS_URL });
  private connected = false;

  constructor() {
    this.connect();
  }

  private async connect() {
    try {
      await this.client.connect();
      this.connected = true;
      logger.info('Redis cache connected');
    } catch (error) {
      logger.warn('Redis not available, using memory cache fallback');
      this.connected = false;
    }
  }

  async get(key: string): Promise<any> {
    if (!this.connected) return null;

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    if (!this.connected) return;

    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }
}

------------------------------------------------------------------------------------------------------------------------