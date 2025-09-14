/**
 * TRILHO B AÇÃO 4 - Interface AIProvider refinada com Strategy Pattern
 * 
 * Interface unificada que define o contrato para todos os providers AI.
 * Segue SOLID principles com responsabilidade única e extensibilidade.
 */

import type { 
  EmotionalAnalysisRequest, 
  EmotionalAnalysisResponse 
} from '../../../../packages/shared/types/api';
import type { 
  ProviderStatus, 
  CircuitBreakerConfig,
  ProviderStateChangeEvent 
} from './ProviderTypes';

/**
 * Interface principal para Strategy Pattern de providers AI
 * 
 * Todos os providers devem implementar esta interface para garantir
 * consistência e permitir substituição transparente (Liskov Substitution Principle)
 */
export interface AIProvider {
  /** Nome único do provider */
  readonly name: string;
  
  /** Versão do provider */
  readonly version: string;

  /**
   * Analisa requisição emocional e retorna resposta
   * @param request Dados da requisição emocional
   * @returns Promise com análise emocional processada
   * @throws ProviderError em caso de falha
   */
  analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse>;

  /**
   * Retorna status detalhado do provider
   * @returns Status atual incluindo saúde e circuit breaker
   */
  getStatus(): ProviderStatus;

  /**
   * Verifica se o provider está saudável
   * @returns true se operacional, false caso contrário
   */
  isHealthy(): boolean;

  /**
   * Atualiza configuração do circuit breaker
   * @param config Nova configuração
   */
  updateCircuitBreakerConfig(config: Partial<CircuitBreakerConfig>): void;

  /**
   * Reseta o circuit breaker para estado inicial
   */
  resetCircuitBreaker(): void;

  /**
   * Registra listener para mudanças de estado
   * @param listener Função chamada quando estado muda
   */
  onStateChange(listener: (event: ProviderStateChangeEvent) => void): void;

  /**
   * Remove listener de mudanças de estado
   * @param listener Função a ser removida
   */
  offStateChange(listener: (event: ProviderStateChangeEvent) => void): void;
}

/**
 * Classe base abstrata para implementação de providers
 * 
 * Fornece implementação comum do circuit breaker e gerenciamento de estado
 * seguindo Template Method pattern
 */
export abstract class BaseAIProvider implements AIProvider {
  abstract readonly name: string;
  abstract readonly version: string;

  protected circuitBreakerConfig: CircuitBreakerConfig;
  protected circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  protected failures = 0;
  protected nextRetryAt = 0;
  protected lastErrorCode: string | null = null;
  protected stateChangeListeners: Array<(event: ProviderStateChangeEvent) => void> = [];

  constructor(circuitBreakerConfig?: Partial<CircuitBreakerConfig>) {
    this.circuitBreakerConfig = {
      failureThreshold: 3,
      cooldownMs: 60000, // 1 minute
      retryBaseMs: 1000,
      retryMaxMs: 10000,
      ...circuitBreakerConfig
    };
  }

  /**
   * Implementação template method para análise
   * Gerencia circuit breaker automaticamente
   */
  async analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    if (this.circuitState === 'OPEN') {
      if (Date.now() < this.nextRetryAt) {
        throw new Error(`Circuit breaker OPEN for ${this.name}. Retry at ${new Date(this.nextRetryAt)}`);
      }
      this.circuitState = 'HALF_OPEN';
      this.emitStateChange('OPEN', 'HALF_OPEN', 'Circuit breaker cooldown expired');
    }

    try {
      const result = await this.performAnalysis(request);
      
      if (this.circuitState === 'HALF_OPEN') {
        this.closeCircuit();
      }
      
      return result;
    } catch (error) {
      this.handleFailure(error);
      throw error;
    }
  }

  /**
   * Método abstrato que deve ser implementado por cada provider
   * Contém a lógica específica de análise
   */
  protected abstract performAnalysis(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse>;

  getStatus(): ProviderStatus {
    return {
      name: this.name,
      isHealthy: this.isHealthy(),
      circuitState: this.circuitState,
      failures: this.failures,
      nextRetryAt: this.nextRetryAt || null,
      lastErrorCode: this.lastErrorCode,
      metadata: this.getProviderMetadata()
    };
  }

  isHealthy(): boolean {
    return this.circuitState === 'CLOSED' || 
           (this.circuitState === 'HALF_OPEN' && Date.now() >= this.nextRetryAt);
  }

  updateCircuitBreakerConfig(config: Partial<CircuitBreakerConfig>): void {
    this.circuitBreakerConfig = { ...this.circuitBreakerConfig, ...config };
  }

  resetCircuitBreaker(): void {
    const previousState = this.circuitState;
    this.circuitState = 'CLOSED';
    this.failures = 0;
    this.nextRetryAt = 0;
    this.lastErrorCode = null;
    
    if (previousState !== 'CLOSED') {
      this.emitStateChange(previousState, 'CLOSED', 'Circuit breaker manually reset');
    }
  }

  onStateChange(listener: (event: ProviderStateChangeEvent) => void): void {
    this.stateChangeListeners.push(listener);
  }

  offStateChange(listener: (event: ProviderStateChangeEvent) => void): void {
    this.stateChangeListeners = this.stateChangeListeners.filter(l => l !== listener);
  }

  /**
   * Método protegido para obter metadata específica do provider
   * Pode ser sobrescrito por implementações específicas
   */
  protected getProviderMetadata(): Record<string, any> {
    return {};
  }

  /**
   * Gerencia falhas e circuit breaker
   */
  private handleFailure(error: any): void {
    this.failures++;
    this.lastErrorCode = error?.code || error?.message || 'UNKNOWN_ERROR';

    if (this.failures >= this.circuitBreakerConfig.failureThreshold) {
      this.openCircuit('Failure threshold exceeded');
    }
  }

  /**
   * Abre o circuit breaker
   */
  private openCircuit(reason: string): void {
    const previousState = this.circuitState;
    this.circuitState = 'OPEN';
    this.nextRetryAt = Date.now() + this.circuitBreakerConfig.cooldownMs;
    
    this.emitStateChange(previousState, 'OPEN', reason);
  }

  /**
   * Fecha o circuit breaker
   */
  private closeCircuit(): void {
    const previousState = this.circuitState;
    this.circuitState = 'CLOSED';
    this.failures = 0;
    this.nextRetryAt = 0;
    this.lastErrorCode = null;
    
    this.emitStateChange(previousState, 'CLOSED', 'Circuit breaker closed - provider healthy');
  }

  /**
   * Emite evento de mudança de estado
   */
  private emitStateChange(
    previousState: 'CLOSED' | 'OPEN' | 'HALF_OPEN',
    newState: 'CLOSED' | 'OPEN' | 'HALF_OPEN',
    reason: string
  ): void {
    const event: ProviderStateChangeEvent = {
      providerName: this.name,
      previousState,
      newState,
      reason,
      timestamp: Date.now()
    };

    this.stateChangeListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        // Evita que erro em listener quebre o provider
        console.warn(`Error in state change listener for ${this.name}:`, error);
      }
    });
  }
}

/**
 * Utilitários para trabalhar com requests
 */
export class ProviderUtils {
  /**
   * Extrai texto da requisição de forma segura
   */
  static extractTextFromRequest(request: EmotionalAnalysisRequest): string {
    const input = request as any;
    const text = input?.text || input?.message || input?.prompt || '';
    return typeof text === 'string' ? text.trim() : '';
  }

  /**
   * Cria informações de validação da requisição
   */
  static createValidationInfo(request: EmotionalAnalysisRequest) {
    const text = this.extractTextFromRequest(request);
    
    return {
      hasCurrentState: 'currentState' in request && request.currentState !== undefined,
      hasMousePosition: 'mousePosition' in request && request.mousePosition !== undefined,
      hasText: text.length > 0,
      textLength: text.length,
      requestType: text.length > 0 ? 'text_analysis' : 'state_analysis'
    };
  }

  /**
   * Sanitiza dados sensíveis para logging
   */
  static sanitizeForLogging(request: EmotionalAnalysisRequest): Record<string, any> {
    return {
      textLength: this.extractTextFromRequest(request).length,
      hasCurrentState: 'currentState' in request,
      hasMousePosition: 'mousePosition' in request,
      timestamp: new Date().toISOString()
    };
  }
}
