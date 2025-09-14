/**
 * TRILHO B AÇÃO 4 - ProviderFactory para instanciação centralizada
 * 
 * Factory Pattern que centraliza a criação de providers AI, seguindo
 * Open/Closed Principle - aberto para extensão, fechado para modificação.
 */

import type { AIProvider } from './AIProvider';
import type { 
  ProviderType, 
  ProviderConfig, 
  CircuitBreakerConfig 
} from './ProviderTypes';
import { AnthropicProvider } from './AnthropicProvider';
import { FallbackProvider } from './FallbackProvider';
import { logger } from '../utils/logger';

/**
 * Erro específico de criação de provider
 */
export class ProviderCreationError extends Error {
  constructor(
    public readonly providerType: ProviderType,
    public readonly reason: string,
    public readonly originalError?: Error
  ) {
    super(`Failed to create provider '${providerType}': ${reason}`);
    this.name = 'ProviderCreationError';
  }
}

/**
 * Factory para criação de providers AI
 * 
 * Centraliza a lógica de instanciação seguindo Factory Pattern.
 * Facilita adição de novos providers sem modificar código existente.
 */
export class ProviderFactory {
  private static readonly DEFAULT_CIRCUIT_BREAKER: CircuitBreakerConfig = {
    failureThreshold: 3,
    cooldownMs: 60000, // 1 minute
    retryBaseMs: 1000,
    retryMaxMs: 10000
  };

  /**
   * Registro de construtores de providers
   * Permite adicionar novos providers dinamicamente
   */
  private static readonly providerConstructors = new Map<
    ProviderType, 
    (config?: Partial<CircuitBreakerConfig>) => AIProvider
  >([
    ['anthropic', (config) => new AnthropicProvider(config)],
    ['fallback', (config) => new FallbackProvider(config)],
    // Preparado para novos providers:
    // ['openai', (config) => new OpenAIProvider(config)],
    // ['azure', (config) => new AzureProvider(config)],
    // ['local', (config) => new LocalProvider(config)],
  ]);

  /**
   * Cria um provider do tipo especificado
   * 
   * @param config Configuração do provider
   * @returns Instância do provider criado
   * @throws ProviderCreationError se não conseguir criar
   */
  static createProvider(config: ProviderConfig): AIProvider {
    const { type, circuitBreaker } = config;

    try {
      // Validar tipo de provider
      if (!this.isValidProviderType(type)) {
        throw new ProviderCreationError(
          type,
          `Unknown provider type. Available types: ${this.getAvailableTypes().join(', ')}`
        );
      }

      // Obter construtor
      const constructor = this.providerConstructors.get(type);
      if (!constructor) {
        throw new ProviderCreationError(
          type,
          'Provider constructor not found (this should not happen)'
        );
      }

      // Mesclar configuração do circuit breaker
      const finalCircuitBreakerConfig = {
        ...this.DEFAULT_CIRCUIT_BREAKER,
        ...circuitBreaker
      };

      // Criar instância
      logger.info(`Creating provider: ${type}`, { 
        circuitBreakerConfig: finalCircuitBreakerConfig 
      });

      const provider = constructor(finalCircuitBreakerConfig);

      // Validar instância criada
      this.validateProviderInstance(provider, type);

      logger.info(`Provider created successfully: ${type}`, {
        name: provider.name,
        version: provider.version
      });

      return provider;

    } catch (error) {
      if (error instanceof ProviderCreationError) {
        throw error;
      }

      logger.error(`Failed to create provider: ${type}`, { error });
      throw new ProviderCreationError(type, 'Unexpected error during creation', error as Error);
    }
  }

  /**
   * Cria provider com configuração simples (apenas tipo)
   * 
   * @param type Tipo do provider
   * @returns Instância do provider criado
   */
  static createSimpleProvider(type: ProviderType): AIProvider {
    return this.createProvider({ type });
  }

  /**
   * Cria múltiplos providers de uma vez
   * 
   * @param configs Array de configurações
   * @returns Map com providers criados
   */
  static createMultipleProviders(configs: ProviderConfig[]): Map<ProviderType, AIProvider> {
    const providers = new Map<ProviderType, AIProvider>();
    const errors: ProviderCreationError[] = [];

    for (const config of configs) {
      try {
        const provider = this.createProvider(config);
        providers.set(config.type, provider);
      } catch (error) {
        if (error instanceof ProviderCreationError) {
          errors.push(error);
        }
      }
    }

    if (errors.length > 0) {
      logger.warn(`Some providers failed to create:`, { 
        failedProviders: errors.map(e => ({ type: e.providerType, reason: e.reason }))
      });
    }

    logger.info(`Created ${providers.size}/${configs.length} providers successfully`);
    return providers;
  }

  /**
   * Registra um novo tipo de provider
   * Permite extensibilidade sem modificar a factory
   * 
   * @param type Tipo do provider
   * @param constructor Função construtora
   */
  static registerProvider(
    type: ProviderType,
    constructor: (config?: Partial<CircuitBreakerConfig>) => AIProvider
  ): void {
    if (this.providerConstructors.has(type)) {
      logger.warn(`Provider type '${type}' is being overwritten`);
    }

    this.providerConstructors.set(type, constructor);
    logger.info(`Provider type '${type}' registered successfully`);
  }

  /**
   * Remove registro de um tipo de provider
   * 
   * @param type Tipo do provider a ser removido
   * @returns true se removido, false se não existia
   */
  static unregisterProvider(type: ProviderType): boolean {
    const existed = this.providerConstructors.has(type);
    this.providerConstructors.delete(type);
    
    if (existed) {
      logger.info(`Provider type '${type}' unregistered successfully`);
    }

    return existed;
  }

  /**
   * Retorna tipos de providers disponíveis
   */
  static getAvailableTypes(): ProviderType[] {
    return Array.from(this.providerConstructors.keys());
  }

  /**
   * Verifica se um tipo de provider é válido
   */
  static isValidProviderType(type: string): type is ProviderType {
    return this.providerConstructors.has(type as ProviderType);
  }

  /**
   * Cria configuração padrão para um tipo de provider
   */
  static createDefaultConfig(type: ProviderType): ProviderConfig {
    return {
      type,
      circuitBreaker: { ...this.DEFAULT_CIRCUIT_BREAKER }
    };
  }

  /**
   * Valida instância de provider criada
   */
  private static validateProviderInstance(provider: AIProvider, expectedType: ProviderType): void {
    if (!provider) {
      throw new ProviderCreationError(expectedType, 'Provider constructor returned null/undefined');
    }

    if (typeof provider.analyze !== 'function') {
      throw new ProviderCreationError(expectedType, 'Provider missing analyze method');
    }

    if (typeof provider.getStatus !== 'function') {
      throw new ProviderCreationError(expectedType, 'Provider missing getStatus method');
    }

    if (!provider.name) {
      throw new ProviderCreationError(expectedType, 'Provider missing name property');
    }

    if (!provider.version) {
      throw new ProviderCreationError(expectedType, 'Provider missing version property');
    }
  }

  /**
   * Cria provider com fallback automático
   * Se o provider primário falhar, cria fallback
   */
  static createWithFallback(primaryType: ProviderType, fallbackType: ProviderType = 'fallback'): {
    primary: AIProvider | null;
    fallback: AIProvider;
    errors: ProviderCreationError[];
  } {
    const errors: ProviderCreationError[] = [];
    let primary: AIProvider | null = null;

    try {
      primary = this.createSimpleProvider(primaryType);
    } catch (error) {
      if (error instanceof ProviderCreationError) {
        errors.push(error);
      }
    }

    const fallback = this.createSimpleProvider(fallbackType);

    return { primary, fallback, errors };
  }
}

/**
 * Singleton para factory (opcional)
 * Útil se precisar manter estado global de providers
 */
export class ProviderFactorySingleton {
  private static instance: ProviderFactorySingleton;
  private createdProviders = new Map<string, AIProvider>();

  private constructor() {}

  static getInstance(): ProviderFactorySingleton {
    if (!this.instance) {
      this.instance = new ProviderFactorySingleton();
    }
    return this.instance;
  }

  /**
   * Cria ou retorna provider existente (cache)
   */
  getOrCreateProvider(config: ProviderConfig): AIProvider {
    const key = `${config.type}-${JSON.stringify(config.circuitBreaker || {})}`;
    
    if (!this.createdProviders.has(key)) {
      const provider = ProviderFactory.createProvider(config);
      this.createdProviders.set(key, provider);
    }

    return this.createdProviders.get(key)!;
  }

  /**
   * Limpa cache de providers
   */
  clearCache(): void {
    this.createdProviders.clear();
  }

  /**
   * Retorna estatísticas dos providers em cache
   */
  getCacheStats(): { size: number; providers: string[] } {
    return {
      size: this.createdProviders.size,
      providers: Array.from(this.createdProviders.keys())
    };
  }
}
