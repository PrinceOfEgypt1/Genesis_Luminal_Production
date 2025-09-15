/**
 * GENESIS LUMINAL - MIDDLEWARE INDEX [CORRIGIDO]
 * Centraliza exports de todos os middlewares
 */

// ✅ CORREÇÃO: Exports corretos baseados no código existente
export { errorMiddleware } from './error';
export { sanitizeEmotional } from './sanitizeEmotional';

// ✅ CORREÇÃO: Rate limiting exports (os nomes corretos do arquivo atual)
export { 
  granularRateLimit,
  granularRateLimit as rateLimit,
  granularRateLimit as rateLimitMiddleware,
  healthCheckRateLimit,
  adaptiveRateLimit
} from './rateLimit';

// ✅ CORREÇÃO: Security middleware exports (names corretos do arquivo criado)
export { 
  applySecurity,
  securityHeaders,
  securedCors,
  securityLogger,
  requestSanitizer,
  attackDetection,
  securityTimeout
} from './security';

// ✅ CORREÇÃO: Validation middleware exports
export {
  createValidationMiddleware,
  validateEmotionalAnalysis,
  validateQueryParams,
  validateApiHeaders,
  advancedSanitization,
  payloadSizeLimit,
  applyValidation,
  EmotionalAnalysisSchema,
  QueryParamsSchema,
  ApiHeadersSchema
} from './validation';

// ✅ Re-exports consolidados para compatibilidade
export default {
  error: { errorMiddleware },
  rate: { granularRateLimit, healthCheckRateLimit },
  security: { applySecurity, securityHeaders, securedCors },
  validation: { validateEmotionalAnalysis, validateQueryParams }
};
