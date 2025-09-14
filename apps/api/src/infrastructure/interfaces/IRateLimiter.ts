/**
 * TRILHO B AÇÃO 6 - Interface para Rate Limiter
 * 
 * Interface para abstração de rate limiting, permitindo diferentes estratégias
 * (Memory-based, Redis-based, Token Bucket, Sliding Window, etc.)
 */

export interface IRateLimitConfig {
  /** Número máximo de requests por janela de tempo */
  maxRequests: number;
  /** Janela de tempo em segundos */
  windowSeconds: number;
  /** Tempo de bloqueio em segundos após exceder limite */
  blockDurationSeconds: number;
  /** Identificador único da configuração */
  identifier?: string;
}

export interface IRateLimitResult {
  /** Se a request foi permitida */
  allowed: boolean;
  /** Requests restantes na janela atual */
  remaining: number;
  /** Tempo em segundos até reset da janela */
  resetTime: number;
  /** Tempo em segundos para retry (se bloqueado) */
  retryAfter?: number;
}

export interface IRateLimiter {
  /**
   * Verifica se request é permitida para a chave dada
   */
  checkLimit(key: string, config?: Partial<IRateLimitConfig>): Promise<IRateLimitResult>;
  
  /**
   * Consome um "ponto" para a chave (aplica rate limiting)
   */
  consume(key: string, config?: Partial<IRateLimitConfig>): Promise<IRateLimitResult>;
  
  /**
   * Reset manual de limites para uma chave
   */
  reset(key: string): Promise<void>;
  
  /**
   * Obtém estatísticas do rate limiter
   */
  getStats(): Promise<{
    totalRequests: number;
    blockedRequests: number;
    activeKeys: number;
  }>;
  
  /**
   * Verifica saúde do rate limiter
   */
  isHealthy(): Promise<boolean>;
}

export interface IClientKeyExtractor {
  /**
   * Extrai chave única do cliente baseada na request
   */
  extractKey(req: any): string;
}
