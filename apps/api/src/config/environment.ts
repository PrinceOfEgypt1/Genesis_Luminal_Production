/**
 * TRILHO B AÇÃO 6 - Environment Configuration (CORRIGIDO)
 * 
 * Configuração corrigida para compatibilidade ESModule/CommonJS
 */

import * as dotenv from 'dotenv';

// Configurar dotenv
dotenv.config();

interface EnvironmentConfig {
  PORT: number;
  NODE_ENV: string;
  FRONTEND_URL: string;
  CLAUDE_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  REQUEST_TIMEOUT_MS: number;
  RATE_LIMIT_MAX: number;
  RATE_LIMIT_WINDOW_SEC: number;
  RATE_LIMIT_BLOCK_SEC: number;
  CACHE_TTL_SEC: number;
  CACHE_MAX_SIZE: number;
  REQUEST_SIZE_LIMIT: string;
  TRUST_PROXY: boolean;
}

const config: EnvironmentConfig = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
  REQUEST_TIMEOUT_MS: parseInt(process.env.REQUEST_TIMEOUT_MS || '15000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  RATE_LIMIT_WINDOW_SEC: parseInt(process.env.RATE_LIMIT_WINDOW_SEC || '900', 10),
  RATE_LIMIT_BLOCK_SEC: parseInt(process.env.RATE_LIMIT_BLOCK_SEC || '900', 10),
  CACHE_TTL_SEC: parseInt(process.env.CACHE_TTL_SEC || '300', 10),
  CACHE_MAX_SIZE: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
  REQUEST_SIZE_LIMIT: process.env.REQUEST_SIZE_LIMIT || '1mb',
  TRUST_PROXY: process.env.TRUST_PROXY === 'true'
};

// Validação de configuração crítica
if (config.NODE_ENV === 'production' && !config.CLAUDE_API_KEY) {
  console.warn('WARNING: No Claude API key configured for production');
}

if (config.PORT < 1000 || config.PORT > 65535) {
  throw new Error(`Invalid PORT: ${config.PORT}. Must be between 1000-65535`);
}

export { config };
export type { EnvironmentConfig };
