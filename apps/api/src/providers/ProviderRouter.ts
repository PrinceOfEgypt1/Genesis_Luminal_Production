/**
 * TRILHO B AÇÃO 4 - ProviderRouter refatorado com Factory Pattern
 * 
 * Router responsável apenas por orquestração entre providers,
 * usando ProviderFactory para instanciação. Segue Single Responsibility Principle.
 */

import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '@/shared/types/api';
import type { 
  AIProvider, 
  ProviderType, 
  RoutingConfig, 
  FallbackStrategy,
  ProviderStateChangeEvent 
} from './AIProvider';
import { ProviderFactory } from './ProviderFactory';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Router para orquestração inteligente de providers AI
 * 
 * Responsabilidade única: rotear requisições entre providers disponíveis
 * usando estratégias configuráveis de fallback.
 */
export class ProviderRouter {
  private primaryProvider: AIProvider;
  private fallbackProvider: AIProvider;
  private config: RoutingConfig;
  private requestMetrics: Map<string, { count: number; avgLatency: number; lastUsed: number }>;

  constructor(config?: Partial<RoutingConfig>) {
    this.config = {
      primary: 'anthropic',
      fallback: 'fallback',
      strategy: 'cascade',
      timeoutMs: 30000,
      ...config
    };

    this.requestMetrics = new Map();
    this.initializeProviders();
    this.setupEventListeners();

    logger.info('ProviderRouter initialized', {
      primary: this.config.primary,
      fallback: this.config.fallback,
      strategy: this.config.strategy,
      timeout: this.config.timeoutMs
    });
  }

  /**
   * Inicializa providers usando Factory
   */
  private initializeProviders(): void {
    try {
      // Criar providers com configuração adequada
      const { primary, fallback, errors } = ProviderFactory.createWithFallback(
        this.config.primary,
        this.config.fallback
      );

      if (errors.length > 0) {
        logger.warn('Some providers failed to initialize', { 
          errors: errors.map(e => ({ type: e.providerType, reason: e.reason }))
        });
      }

      // Se provider primário falhou, usar fallback como primário
      if (!primary) {
        logger.warn(`Primary provider ${this.config.primary} failed to initialize, using fallback as primary`);
        this.primaryProvider = fallback;
        this.fallbackProvider = fallback;
      } else {
        this.primaryProvider = primary;
        this.fallbackProvider = fallback;
      }

      logger.info('Providers initialized successfully', {
        primary: this.primaryProvider.name,
        fallback: this.fallbackProvider.name
      });

    } catch (error) {
      logger.error('Failed to initialize providers', { error });
      throw new Error('ProviderRouter initialization failed');
    }
  }

  /**
   * Configura listeners para mudanças de estado dos providers
   */
  private setupEventListeners(): void {
    const handleStateChange = (event: ProviderStateChangeEvent) => {
      logger.info('Provider state changed', {
        provider: event.providerName,
        previousState: event.previousState,
        newState: event.newState,
        reason: event.reason,
        timestamp: new Date(event.timestamp).toISOString()
      });

      // Aqui poderían adicionar lógica para reação a mudanças de estado
      // Como notificações, métricas, etc.
    };

    this.primaryProvider.onStateChange(handleStateChange);
    this.fallbackProvider.onStateChange(handleStateChange);
  }

  /**
   * Analisa requisição usando estratégia de routing configurada
   */
  async analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    logger.debug('Starting analysis request', {
      requestId,
      strategy: this.config.strategy,
      primaryProvider: this.primaryProvider.name,
      fallbackProvider: this.fallbackProvider.name
    });

    try {
      // Aplicar timeout global
      const response = await this.withTimeout(
        this.executeRoutingStrategy(request, requestId),
        this.config.timeoutMs
      );

      this.recordMetrics(this.primaryProvider.name, Date.now() - startTime);
      
      logger.info('Analysis completed successfully', {
        requestId,
        provider: this.primaryProvider.name,
        latency: Date.now() - startTime,
        intensity: response.intensity,
        confidence: response.confidence
      });

      return response;

    } catch (error) {
      logger.error('Analysis request failed', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
        latency: Date.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Executa estratégia de routing configurada
   */
  private async executeRoutingStrategy(
    request: EmotionalAnalysisRequest, 
    requestId: string
  ): Promise<EmotionalAnalysisResponse> {
    switch (this.config.strategy) {
      case 'cascade':
        return this.executeCascadeStrategy(request, requestId);
      
      case 'fastest':
        return this.executeFastestStrategy(request, requestId);
      
      case 'roundrobin':
        return this.executeRoundRobinStrategy(request, requestId);
      
      case 'weighted':
        return this.executeWeightedStrategy(request, requestId);
      
      default:
        logger.warn(`Unknown strategy ${this.config.strategy}, using cascade`);
        return this.executeCascadeStrategy(request, requestId);
    }
  }

  /**
   * Estratégia cascade: tenta primário, se falhar usa fallback
   */
  private async executeCascadeStrategy(
    request: EmotionalAnalysisRequest,
    requestId: string
  ): Promise<EmotionalAnalysisResponse> {
    // Tentar provider primário
    if (this.primaryProvider.isHealthy()) {
      try {
        logger.debug('Trying primary provider', { 
          requestId, 
          provider: this.primaryProvider.name 
        });

        const result = await this.primaryProvider.analyze(request);
        
        // Validar resultado
        if (this.isValidResponse(result)) {
          return result;
        }
        
        logger.warn('Primary provider returned invalid response', { 
          requestId, 
          provider: this.primaryProvider.name 
        });

      } catch (error) {
        logger.warn('Primary provider failed, falling back', {
          requestId,
          provider: this.primaryProvider.name,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    } else {
      logger.debug('Primary provider unhealthy, skipping to fallback', {
        requestId,
        provider: this.primaryProvider.name,
        status: this.primaryProvider.getStatus()
      });
    }

    // Usar fallback
    logger.debug('Using fallback provider', { 
      requestId, 
      provider: this.fallbackProvider.name 
    });

    return this.fallbackProvider.analyze(request);
  }

  /**
   * Estratégia fastest: usa o provider mais rápido baseado em métricas
   */
  private async executeFastestStrategy(
    request: EmotionalAnalysisRequest,
    requestId: string
  ): Promise<EmotionalAnalysisResponse> {
    const primaryMetrics = this.requestMetrics.get(this.primaryProvider.name);
    const fallbackMetrics = this.requestMetrics.get(this.fallbackProvider.name);

    // Se não há métricas, usar cascade como fallback
    if (!primaryMetrics && !fallbackMetrics) {
      return this.executeCascadeStrategy(request, requestId);
    }

    // Determinar provider mais rápido
    const usePrimary = !fallbackMetrics || 
      (primaryMetrics && primaryMetrics.avgLatency < fallbackMetrics.avgLatency);

    const chosenProvider = usePrimary ? this.primaryProvider : this.fallbackProvider;
    const backupProvider = usePrimary ? this.fallbackProvider : this.primaryProvider;

    logger.debug('Using fastest provider', {
      requestId,
      chosen: chosenProvider.name,
      backup: backupProvider.name,
      primaryLatency: primaryMetrics?.avgLatency,
      fallbackLatency: fallbackMetrics?.avgLatency
    });

    try {
      return await chosenProvider.analyze(request);
    } catch (error) {
      logger.warn('Fastest provider failed, using backup', {
        requestId,
        failed: chosenProvider.name,
        backup: backupProvider.name,
        error: error instanceof Error ? error.message : String(error)
      });
      return backupProvider.analyze(request);
    }
  }

  /**
   * Estratégia round-robin: alterna entre providers
   */
  private executeRoundRobinStrategy(
    request: EmotionalAnalysisRequest,
    requestId: string
  ): Promise<EmotionalAnalysisResponse> {
    // Implementação simples baseada em timestamp
    const usePrimary = Math.floor(Date.now() / 1000) % 2 === 0;
    const chosenProvider = usePrimary ? this.primaryProvider : this.fallbackProvider;
    
    logger.debug('Round-robin provider selection', {
      requestId,
      chosen: chosenProvider.name,
      usePrimary
    });

    return chosenProvider.analyze(request);
  }

  /**
   * Estratégia weighted: usa pesos baseados na saúde dos providers
   */
  private async executeWeightedStrategy(
    request: EmotionalAnalysisRequest,
    requestId: string
  ): Promise<EmotionalAnalysisResponse> {
    const primaryWeight = this.calculateProviderWeight(this.primaryProvider);
    const fallbackWeight = this.calculateProviderWeight(this.fallbackProvider);
    
    const totalWeight = primaryWeight + fallbackWeight;
    const random = Math.random() * totalWeight;
    
    const usePrimary = random < primaryWeight;
    const chosenProvider = usePrimary ? this.primaryProvider : this.fallbackProvider;
    const backupProvider = usePrimary ? this.fallbackProvider : this.primaryProvider;

    logger.debug('Weighted provider selection', {
      requestId,
      chosen: chosenProvider.name,
      backup: backupProvider.name,
      primaryWeight,
      fallbackWeight,
      random
    });

    try {
      return await chosenProvider.analyze(request);
    } catch (error) {
      return backupProvider.analyze(request);
    }
  }

  /**
   * Calcula peso do provider baseado na saúde e performance
   */
  private calculateProviderWeight(provider: AIProvider): number {
    const baseWeight = provider.isHealthy() ? 10 : 1;
    const metrics = this.requestMetrics.get(provider.name);
    
    if (!metrics) return baseWeight;
    
    // Reduzir peso se latência for alta
    const latencyPenalty = Math.max(0, (metrics.avgLatency - 1000) / 1000);
    return Math.max(1, baseWeight - latencyPenalty);
  }

  /**
   * Aplica timeout a uma promise
   */
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Valida se resposta é válida
   */
  private isValidResponse(response: any): response is EmotionalAnalysisResponse {
    return response &&
      typeof response.intensity === 'number' &&
      typeof response.timestamp === 'string' &&
      typeof response.confidence === 'number' &&
      response.intensity >= 0 && response.intensity <= 1 &&
      response.confidence >= 0 && response.confidence <= 1;
  }

  /**
   * Registra métricas de performance
   */
  private recordMetrics(providerName: string, latency: number): void {
    const existing = this.requestMetrics.get(providerName);
    
    if (!existing) {
      this.requestMetrics.set(providerName, {
        count: 1,
        avgLatency: latency,
        lastUsed: Date.now()
      });
    } else {
      const newCount = existing.count + 1;
      const newAvgLatency = (existing.avgLatency * existing.count + latency) / newCount;
      
      this.requestMetrics.set(providerName, {
        count: newCount,
        avgLatency: newAvgLatency,
        lastUsed: Date.now()
      });
    }
  }

  /**
   * Gera ID único para request
   */
  private generateRequestId(): string {
    return `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Retorna status detalhado do router e providers
   */
  getStatus(): {
    router: {
      config: RoutingConfig;
      metrics: Record<string, any>;
    };
    providers: {
      primary: any;
      fallback: any;
    };
  } {
    return {
      router: {
        config: this.config,
        metrics: Object.fromEntries(this.requestMetrics)
      },
      providers: {
        primary: this.primaryProvider.getStatus(),
        fallback: this.fallbackProvider.getStatus()
      }
    };
  }

  /**
   * Atualiza configuração do router
   */
  updateConfig(newConfig: Partial<RoutingConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    logger.info('Router configuration updated', {
      oldConfig,
      newConfig: this.config
    });

    // Se mudaram os tipos de providers, reinicializar
    if (newConfig.primary && newConfig.primary !== oldConfig.primary ||
        newConfig.fallback && newConfig.fallback !== oldConfig.fallback) {
      logger.info('Provider types changed, reinitializing...');
      this.initializeProviders();
    }
  }

  /**
   * Força switch para fallback (útil para manutenção)
   */
  forceFallback(): void {
    this.primaryProvider.resetCircuitBreaker();
    logger.warn('Router forced to fallback mode');
  }

  /**
   * Reseta métricas de performance
   */
  resetMetrics(): void {
    this.requestMetrics.clear();
    logger.info('Router metrics reset');
  }
}
