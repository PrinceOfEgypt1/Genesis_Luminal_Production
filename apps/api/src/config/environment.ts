/**
 * Environment Configuration - TRILHO B Ação 6
 * Configuração completa para resolver missing properties
 */

import * as dotenv from 'dotenv';

dotenv.config();

export interface EnvironmentConfig {
  PORT: number;
  NODE_ENV: string;
  FRONTEND_URL: string;
  CLAUDE_API_KEY: string;
  REDIS_URL?: string; // ✅ ADICIONADO para resolver erro
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
}

export const config: EnvironmentConfig = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || '',
  REDIS_URL: process.env.REDIS_URL, // ✅ Opcional, pode ser undefined
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
};
