/**
 * TRILHO B AÇÃO 6 - Interface para Cache Service
 * 
 * Interface para abstração de cache, permitindo diferentes implementações
 * (Redis, In-Memory, File-based, etc.)
 */

export interface ICacheEntry<T = any> {
  value: T;
  ttl: number;
  createdAt: number;
}

export interface ICacheService {
  /**
   * Recupera valor do cache
   */
  get<T = any>(key: string): Promise<T | null>;
  
  /**
   * Armazena valor no cache com TTL
   */
  set<T = any>(key: string, value: T, ttlSeconds: number): Promise<void>;
  
  /**
   * Remove chave do cache
   */
  delete(key: string): Promise<boolean>;
  
  /**
   * Limpa todo o cache
   */
  clear(): Promise<void>;
  
  /**
   * Verifica se chave existe no cache
   */
  has(key: string): Promise<boolean>;
  
  /**
   * Obtém estatísticas do cache
   */
  getStats(): Promise<{
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  }>;
  
  /**
   * Verifica saúde do cache
   */
  isHealthy(): Promise<boolean>;
}
