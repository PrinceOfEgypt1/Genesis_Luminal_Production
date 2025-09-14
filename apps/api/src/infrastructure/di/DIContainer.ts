/**
 * Dependency Injection Container
 * Centraliza criação e configuração de dependências
 */

import { AnalyzeEmotionalStateUseCase } from '../../application/usecases/AnalyzeEmotionalStateUseCase';
import { HealthCheckUseCase } from '../../application/usecases/HealthCheckUseCase';
import { EmotionalAnalyzerAdapter } from '../adapters/EmotionalAnalyzerAdapter';
import { CacheServiceAdapter } from '../adapters/CacheServiceAdapter';
import { LoggerAdapter } from '../adapters/LoggerAdapter';

export class DIContainer {
  private static instance: DIContainer;
  
  // Singletons
  private _analyzer?: EmotionalAnalyzerAdapter;
  private _cache?: CacheServiceAdapter;
  private _logger?: LoggerAdapter;
  private _analyzeEmotionalStateUseCase?: AnalyzeEmotionalStateUseCase;
  private _healthCheckUseCase?: HealthCheckUseCase;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Adapters (Infrastructure)
  getAnalyzer(): EmotionalAnalyzerAdapter {
    if (!this._analyzer) {
      this._analyzer = new EmotionalAnalyzerAdapter();
    }
    return this._analyzer;
  }

  getCache(): CacheServiceAdapter {
    if (!this._cache) {
      this._cache = new CacheServiceAdapter();
    }
    return this._cache;
  }

  getLogger(): LoggerAdapter {
    if (!this._logger) {
      this._logger = new LoggerAdapter();
    }
    return this._logger;
  }

  // Use Cases (Application)
  getAnalyzeEmotionalStateUseCase(): AnalyzeEmotionalStateUseCase {
    if (!this._analyzeEmotionalStateUseCase) {
      this._analyzeEmotionalStateUseCase = new AnalyzeEmotionalStateUseCase(
        this.getAnalyzer(),
        this.getCache(),
        this.getLogger()
      );
    }
    return this._analyzeEmotionalStateUseCase;
  }

  getHealthCheckUseCase(): HealthCheckUseCase {
    if (!this._healthCheckUseCase) {
      this._healthCheckUseCase = new HealthCheckUseCase(
        this.getAnalyzer(),
        this.getCache(),
        this.getLogger()
      );
    }
    return this._healthCheckUseCase;
  }

  // Reset para testes
  reset(): void {
    this._analyzer = undefined;
    this._cache = undefined;
    this._logger = undefined;
    this._analyzeEmotionalStateUseCase = undefined;
    this._healthCheckUseCase = undefined;
  }
}

// Export singleton instance
export const diContainer = DIContainer.getInstance();
