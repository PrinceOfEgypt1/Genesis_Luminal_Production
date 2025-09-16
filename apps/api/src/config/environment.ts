/**
 * GENESIS LUMINAL - CONFIGURAÇÃO DE AMBIENTE ATUALIZADA
 * Configurações de ambiente com suporte a segurança OWASP
 */

import dotenv from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '../../.env') });

export interface AppConfig {
  // Configurações básicas
  NODE_ENV: string;
  PORT: number;
  FRONTEND_URL: string;
  
  // API Keys
  CLAUDE_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_MODEL: string;
  
  // Cache/Redis
  REDIS_URL?: string;
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
  
  // Timeouts
  REQUEST_TIMEOUT_MS: number;
  
  // Segurança
  CORS_ALLOWED_ORIGINS: string[];
  ENABLE_SECURITY_LOGS: boolean;
  MAX_PAYLOAD_SIZE: string;
  
  // Recursos
  CLAUDE_OFFLINE_MODE: boolean;
  SUPPRESS_CLAUDE_QUOTA_LOGS: boolean;
}

// Função para parsing de arrays de strings
const parseStringArray = (value: string | undefined, defaultValue: string[] = []): string[] => {
  if (!value) return defaultValue;
  return value.split(',').map(s => s.trim()).filter(Boolean);
};

// Função para parsing de boolean
const parseBoolean = (value: string | undefined, defaultValue: boolean = false): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

// Função para parsing de número
const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const config: AppConfig = {
  // Configurações básicas
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseNumber(process.env.PORT, 3001),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // API Keys
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620',
  
  // Cache/Redis
  REDIS_URL: process.env.REDIS_URL,
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 900000), // 15 min
  RATE_LIMIT_MAX: parseNumber(process.env.RATE_LIMIT_MAX, 100),
  
  // Timeouts
  REQUEST_TIMEOUT_MS: parseNumber(process.env.REQUEST_TIMEOUT_MS, 15000),
  
  // Segurança
  CORS_ALLOWED_ORIGINS: parseStringArray(process.env.CORS_ALLOWED_ORIGINS),
  ENABLE_SECURITY_LOGS: parseBoolean(process.env.ENABLE_SECURITY_LOGS, true),
  MAX_PAYLOAD_SIZE: process.env.MAX_PAYLOAD_SIZE || '1mb',
  
  // Recursos
  CLAUDE_OFFLINE_MODE: parseBoolean(process.env.CLAUDE_OFFLINE_MODE, false),
  SUPPRESS_CLAUDE_QUOTA_LOGS: parseBoolean(process.env.SUPPRESS_CLAUDE_QUOTA_LOGS, true)
};

// Validações de configuração crítica
export const validateConfig = (): void => {
  const errors: string[] = [];
  
  if (!config.FRONTEND_URL) {
    errors.push('FRONTEND_URL é obrigatório');
  }
  
  if (!config.CLAUDE_API_KEY && !config.ANTHROPIC_API_KEY && !config.CLAUDE_OFFLINE_MODE) {
    errors.push('CLAUDE_API_KEY ou ANTHROPIC_API_KEY é obrigatório quando CLAUDE_OFFLINE_MODE é false');
  }
  
  if (config.PORT < 1 || config.PORT > 65535) {
    errors.push('PORT deve estar entre 1 e 65535');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuração inválida: ${errors.join(', ')}`);
  }
};

// Validar configuração na inicialização
validateConfig();

export default config;
