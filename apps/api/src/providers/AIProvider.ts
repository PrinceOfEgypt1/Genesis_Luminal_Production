/**
 * AI Provider Interface - TRILHO B Ação 6
 * Interface base com exports completos
 */

import type { EmotionalAnalysisRequest, EmotionalAnalysisResponse } from '../types/shared';

export interface AIProvider {
  analyze(request: EmotionalAnalysisRequest): Promise<EmotionalAnalysisResponse>;
  isAvailable(): Promise<boolean>;
  getProviderName(): string;
}

// ✅ EXPORTAR todos os tipos necessários
export {
  ProviderType,
  RoutingConfig,
  FallbackStrategy,
  ProviderStateChangeEvent,
  extractTextFromRequest
} from '../types/shared';
