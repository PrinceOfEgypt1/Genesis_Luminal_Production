/**
 * Interface para Cache Service - Infraestrutura Crosscutting
 * TRILHO B - Ação 6: Separar Infraestrutura Crosscutting
 * 
 * Define contrato limpo para operações de cache, seguindo
 * Dependency Inversion Principle (DIP) do SOLID
 */

export interface ICacheService {
  /**
   * Recupera valor do cache por chave
   * @param key Chave única para busca
   * @returns Promise com valor encontrado ou null
   */
  get(key: string): Promise<any>;

  /**
   * Armazena valor no cache com TTL
   * @param key Chave única para armazenamento
   * @param value Valor a ser cacheado (será serializado como JSON)
   * @param ttl Tempo de vida em segundos
   */
  set(key: string, value: any, ttl: number): Promise<void>;

  /**
   * Remove item específico do cache
   * @param key Chave a ser removida
   */
  delete?(key: string): Promise<void>;

  /**
   * Limpa todo o cache
   */
  clear?(): Promise<void>;

  /**
   * Verifica se o cache está conectado/disponível
   */
  isHealthy(): Promise<boolean>;

  /**
   * Obtém estatísticas do cache
   */
  getStats?(): Promise<{
    hits: number;
    misses: number;
    size: number;
    uptime: number;
  }>;
}

/**
 * Configurações do Cache Service
 */
export interface ICacheConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  defaultTTL?: number;
  maxMemory?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Tipos de cache disponíveis
 */
export enum CacheType {
  REDIS = 'redis',
  MEMORY = 'memory',
  HYBRID = 'hybrid'
}

/**
 * Resultado de operação de cache
 */
export interface CacheResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
  source: 'cache' | 'fallback' | 'error';
  timestamp: number;
}

