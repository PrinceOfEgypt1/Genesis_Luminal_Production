/**
 * TRILHO B AÇÃO 4 - Tipos centralizados para Provider Strategy Pattern
 * 
 * Centraliza todos os tipos relacionados aos providers AI para facilitar
 * extensibilidade e manutenção do código.
 */

import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../packages/shared/types/api';

/**
 * Configuração para Circuit Breaker pattern
 */
export interface CircuitBreakerConfig {
  /** Número máximo de falhas antes de abrir o circuito */
  failureThreshold: number;
  /** Tempo em ms antes de tentar fechar o circuito */
  cooldownMs: number;
  /** Tempo base para retry em ms */
  retryBaseMs: number;
  /** Tempo máximo para retry em ms */
  retryMaxMs: number;
}

/**
 * Estados possíveis do Circuit Breaker
 */
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Status detalhado de um provider
 */
export interface ProviderStatus {
  /** Nome do provider */
  name: string;
  /** Se o provider está operacional */
  isHealthy: boolean;
  /** Estado do circuit breaker */
  circuitState: CircuitState;
  /** Número de falhas consecutivas */
  failures: number;
  /** Timestamp da próxima tentativa (se em cooldown) */
  nextRetryAt: number | null;
  /** Código do último erro */
  lastErrorCode: string | null;
  /** Metadata adicional específica do provider */
  metadata?: Record<string, any>;
}

/**
 * Configuração para criação de providers
 */
export interface ProviderConfig {
  /** Tipo do provider */
  type: ProviderType;
  /** Configurações específicas do provider */
  options?: Record<string, any>;
  /** Configuração do circuit breaker */
  circuitBreaker?: Partial<CircuitBreakerConfig>;
}

/**
 * Tipos de providers disponíveis
 * Facilita adição de novos providers sem modificar código existente
 */
export type ProviderType = 
  | 'anthropic' 
  | 'fallback' 
  | 'openai'      // Preparado para futuro
  | 'azure'       // Preparado para futuro
  | 'local'       // Preparado para futuro
  | 'mock';       // Para testes

/**
 * Estratégia de fallback para quando providers falham
 */
export type FallbackStrategy = 
  | 'cascade'     // Tenta providers em sequência
  | 'fastest'     // Usa o provider mais rápido disponível
  | 'roundrobin'  // Alterna entre providers
  | 'weighted';   // Usa pesos para distribuição

/**
 * Configuração de roteamento de providers
 */
export interface RoutingConfig {
  /** Provider primário */
  primary: ProviderType;
  /** Provider de fallback */
  fallback: ProviderType;
  /** Estratégia de fallback */
  strategy: FallbackStrategy;
  /** Timeout global em ms */
  timeoutMs: number;
}

/**
 * Evento emitido quando provider muda de estado
 */
export interface ProviderStateChangeEvent {
  /** Nome do provider */
  providerName: string;
  /** Estado anterior */
  previousState: CircuitState;
  /** Novo estado */
  newState: CircuitState;
  /** Razão da mudança */
  reason: string;
  /** Timestamp do evento */
  timestamp: number;
}
