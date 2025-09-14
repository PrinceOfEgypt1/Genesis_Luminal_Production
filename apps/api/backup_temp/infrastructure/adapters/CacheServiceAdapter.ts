/**
 * Adapter que implementa ICacheService usando CacheService existente
 */

import { ICacheService } from '../../domain/interfaces/IEmotionalAnalyzer';
import { CacheService } from '../../services/CacheService';

export class CacheServiceAdapter implements ICacheService {
  private cacheService: CacheService;

  constructor() {
    this.cacheService = new CacheService();
  }

  async get(key: string): Promise<any> {
    return await this.cacheService.get(key);
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    return await this.cacheService.set(key, value, ttl);
  }
}
