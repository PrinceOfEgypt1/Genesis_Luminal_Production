/**
 * GENESIS LUMINAL - SECURITY CONFIGURATION
 * Configurações de segurança para testes
 */

export const securityConfig = {
  // Headers de segurança obrigatórios
  requiredHeaders: [
    'x-content-type-options',
    'x-frame-options', 
    'x-xss-protection'
  ],
  
  // Headers opcionais mas recomendados
  recommendedHeaders: [
    'strict-transport-security',
    'content-security-policy',
    'referrer-policy'
  ],
  
  // Padrões maliciosos para detectar
  maliciousPatterns: [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /document\.cookie/gi,
    /\.\.\/.*\.\./gi
  ],
  
  // Rate limits esperados
  rateLimits: {
    perMinute: 100,
    perHour: 1000,
    perDay: 10000
  },
  
  // Configuração de CORS segura
  corsConfig: {
    allowedOrigins: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://genesis-luminal.app'
    ],
    maxAge: 86400,
    credentials: false
  }
};

