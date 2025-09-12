/**
 * Configuração de ambiente
 */

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Claude API
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
  CLAUDE_API_URL: 'https://api.anthropic.com/v1/messages',
  CLAUDE_MODEL: 'claude-3-5-sonnet-20241022',
  
  // Redis Cache
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  CACHE_TTL: 300, // 5 minutes
  
  // Rate Limiting (ajustado para desenvolvimento)
  RATE_LIMIT_WINDOW_MS: 1 * 60 * 1000, // 1 minute
  RATE_LIMIT_MAX: 1000, // requests per window
};
