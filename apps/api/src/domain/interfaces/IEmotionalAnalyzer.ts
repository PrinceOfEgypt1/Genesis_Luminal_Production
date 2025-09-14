/**
 * Interface de domínio para análise emocional
 * Implementa Dependency Inversion Principle (DIP)
 */

import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../../../../../packages/shared/types/api';

export interface IEmotionalAnalyzer {
  /**
   * Analisa estado emocional baseado em requisição
   */
  analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse>;
  
  /**
   * Retorna status do analisador
   */
  getStatus(): { ok: boolean; provider: string };
}

/**
 * Interface para serviços de cache
 */
export interface ICacheService {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl: number): Promise<void>;
}

/**
 * Interface para logging
 */
export interface ILogger {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

/**
 * Interface para provider de health check
 */
export interface IHealthProvider {
  checkHealth(): Promise<{ status: string; details?: any }>;
  checkReadiness(): Promise<{ status: string; ready: boolean }>;
}
