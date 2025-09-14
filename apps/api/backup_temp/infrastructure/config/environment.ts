import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Claude API Configuration
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
  CLAUDE_API_URL: process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages',
  CLAUDE_MODEL: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20240620',
  CLAUDE_OFFLINE_MODE: process.env.CLAUDE_OFFLINE_MODE === 'true', // ✅ ADICIONADO
  
  // Cache Configuration
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  CACHE_TTL: parseInt(process.env.CACHE_TTL || '300'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100')
} as const;
