/**
 * Middleware Index - Infraestrutura Crosscutting
 * TRILHO B - Ação 6: Separar Infraestrutura Crosscutting
 * 
 * Centralizador de exports para todos os middlewares
 */

// Security Middleware
export { SecurityMiddleware } from './security';
export { default as SecurityMiddlewareDefault } from './security';

// Rate Limiting Middleware
export { rateLimit, rateLimitMiddleware } from './rateLimit';
export { default as RateLimitDefault } from './rateLimit';

// Error Handling Middleware
export { errorMiddleware } from './error';

// Sanitization Middleware
export { sanitizeEmotional } from './sanitizeEmotional';

/**
 * Middleware Application Helper
 * Aplica todos os middlewares na ordem correta
 */
import { Express } from 'express';
import { SecurityMiddleware } from './security';
import { rateLimitMiddleware } from './rateLimit';
import { errorMiddleware } from './error';
import { config } from '../config/environment';

export interface MiddlewareConfig {
  enableSecurity?: boolean;
  enableRateLimit?: boolean;
  enableErrorHandling?: boolean;
  securityConfig?: {
    corsConfig?: any;
    helmetConfig?: any;
  };
}

/**
 * Aplica todos os middlewares de infraestrutura na aplicação
 */
export function applyInfrastructureMiddleware(
  app: Express, 
  middlewareConfig: MiddlewareConfig = {}
): void {
  const {
    enableSecurity = true,
    enableRateLimit = true,
    enableErrorHandling = true,
    securityConfig = {}
  } = middlewareConfig;

  // 1. Security Middleware (CORS, Helmet, Compression)
  if (enableSecurity) {
    const env = config.NODE_ENV;
    const isProduction = env === 'production';
    
    const envConfig = isProduction 
      ? SecurityMiddleware.forProduction()
      : SecurityMiddleware.forDevelopment();

    SecurityMiddleware.apply(
      app,
      { ...envConfig.corsConfig, ...securityConfig.corsConfig },
      { ...envConfig.helmetConfig, ...securityConfig.helmetConfig }
    );

    // Headers customizados
    app.use(SecurityMiddleware.customSecurityHeaders());
  }

  // 2. Rate Limiting (aplicar após health checks)
  if (enableRateLimit) {
    // Nota: Rate limiting deve ser aplicado seletivamente
    // Health checks não devem ter rate limit
    app.use('/api/emotional', rateLimitMiddleware);
    app.use('/api/claude', rateLimitMiddleware);
    // Health endpoints (/api/liveness, /api/readiness, /api/status) ficam sem rate limit
  }

  // 3. Error Handling (sempre por último)
  if (enableErrorHandling) {
    app.use(errorMiddleware);
  }
}

/**
 * Configuração de middleware para desenvolvimento
 */
export const developmentMiddlewareConfig: MiddlewareConfig = {
  enableSecurity: true,
  enableRateLimit: false, // Desabilitar rate limit em dev para facilitar testes
  enableErrorHandling: true,
  securityConfig: SecurityMiddleware.forDevelopment()
};

/**
 * Configuração de middleware para produção
 */
export const productionMiddlewareConfig: MiddlewareConfig = {
  enableSecurity: true,
  enableRateLimit: true,
  enableErrorHandling: true,
  securityConfig: SecurityMiddleware.forProduction()
};
