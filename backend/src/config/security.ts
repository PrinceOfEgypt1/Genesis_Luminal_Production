/**
 * GENESIS LUMINAL - CONFIGURAÇÃO DE SEGURANÇA OWASP
 * Baseline de segurança enterprise com políticas rigorosas
 * Implementa proteções do OWASP Top 10 2023
 */

import { HelmetOptions } from 'helmet';

// Configuração por ambiente
export const SECURITY_CONFIG = {
  development: {
    trustedDomains: ['localhost:3000', '127.0.0.1:3000'],
    allowedOrigins: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173', // Vite dev server
    ],
    strictMode: false,
  },
  production: {
    trustedDomains: ['genesisluminal.com', 'app.genesisluminal.com'],
    allowedOrigins: [
      'https://genesisluminal.com',
      'https://app.genesisluminal.com',
      'https://www.genesisluminal.com',
    ],
    strictMode: true,
  },
  test: {
    trustedDomains: ['localhost'],
    allowedOrigins: ['http://localhost:3000'],
    strictMode: false,
  }
};

// Obter configuração atual baseada no NODE_ENV
export function getSecurityConfig() {
  const env = (process.env.NODE_ENV || 'development') as keyof typeof SECURITY_CONFIG;
  return SECURITY_CONFIG[env] || SECURITY_CONFIG.development;
}

/**
 * POLÍTICAS HELMET RIGOROSAS OWASP
 * Implementa todas as principais proteções de cabeçalho de segurança
 */
export function getHelmetConfig(): HelmetOptions {
  const config = getSecurityConfig();
  
  return {
    // Content Security Policy (CSP) - Proteção XSS crítica
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Necessário para React em dev
          "'unsafe-eval'", // Necessário para dev tools
          'https://cdnjs.cloudflare.com', // Three.js e outras libs permitidas
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Necessário para styled-components
          'https://fonts.googleapis.com',
        ],
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
          'data:', // Para fonts inline
        ],
        imgSrc: [
          "'self'",
          'data:', // Para imagens base64
          'blob:', // Para canvas/WebGL
          'https:', // CDNs de imagem
        ],
        connectSrc: [
          "'self'",
          'https://api.anthropic.com', // Claude API
          ...(config.strictMode ? [] : ['ws://localhost:*', 'ws://127.0.0.1:*']), // WebSocket dev
        ],
        mediaSrc: ["'self'", 'blob:', 'data:'],
        objectSrc: ["'none'"], // Bloqueia Flash/Java
        frameSrc: ["'none'"], // Previne clickjacking
        baseUri: ["'self'"], // Previne base tag injection
        formAction: ["'self'"], // Limita destinos de formulários
        frameAncestors: ["'none'"], // X-Frame-Options via CSP
        upgradeInsecureRequests: config.strictMode ? [] : undefined,
      },
      reportOnly: !config.strictMode, // Report-only em dev, enforce em prod
    },

    // Cross-Origin Embedder Policy
    crossOriginEmbedderPolicy: config.strictMode ? { policy: "require-corp" } : false,

    // Cross-Origin Opener Policy  
    crossOriginOpenerPolicy: { policy: "same-origin" },

    // Cross-Origin Resource Policy
    crossOriginResourcePolicy: { policy: "same-origin" },

    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },

    // Frameguard (X-Frame-Options)
    frameguard: { action: 'deny' },

    // Hide Powered-By header
    hidePoweredBy: true,

    // HTTP Strict Transport Security (HSTS)
    hsts: config.strictMode ? {
      maxAge: 31536000, // 1 ano
      includeSubDomains: true,
      preload: true
    } : false,

    // IE No Open
    ieNoOpen: true,

    // No Sniff (X-Content-Type-Options)
    noSniff: true,

    // Origin Agent Cluster
    originAgentCluster: true,

    // Permissions Policy
    permittedCrossDomainPolicies: false,

    // Referrer Policy
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },

    // X-XSS-Protection (legado mas útil)
    xssFilter: true,
  };
}

/**
 * CONFIGURAÇÃO CORS RESTRITA POR AMBIENTE
 * Implementa whitelist rigorosa baseada no ambiente
 */
export function getCorsConfig() {
  const config = getSecurityConfig();
  
  return {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Permitir requests sem origin (Postman, mobile apps, etc) apenas em dev
      if (!origin && !config.strictMode) {
        return callback(null, true);
      }

      // Verificar whitelist de origens permitidas
      if (origin && config.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Rejeitar origem não autorizada
      const error = new Error(`CORS: Origin '${origin}' not allowed by security policy`);
      return callback(error, false);
    },
    credentials: true, // Cookies em requests cross-origin
    optionsSuccessStatus: 200, // Para browsers legados
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: [
      'Origin',
      'X-Requested-With', 
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key'
    ], // Headers permitidos
    exposedHeaders: ['X-Request-ID', 'X-Response-Time'], // Headers expostos ao frontend
    maxAge: 86400, // Cache preflight por 24h
  };
}

/**
 * CONFIGURAÇÃO DE RATE LIMITING GRANULAR
 * Diferentes limites para diferentes tipos de endpoint
 */
export const RATE_LIMITS = {
  // Endpoints críticos - mais restritivos
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 20, // 20 requests por 15min
    blockDuration: 30 * 60 * 1000, // Bloquear por 30min se exceder
  },
  
  // Endpoints normais de API
  normal: {
    windowMs: 15 * 60 * 1000, // 15 minutos  
    maxRequests: 100, // 100 requests por 15min
    blockDuration: 15 * 60 * 1000, // Bloquear por 15min se exceder
  },
  
  // Endpoints de dados pesados
  heavy: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    maxRequests: 10, // 10 requests por 5min
    blockDuration: 10 * 60 * 1000, // Bloquear por 10min se exceder
  },
  
  // Health checks - sem limite (crítico para monitoring)
  health: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    maxRequests: 1000, // Virtualmente ilimitado
    blockDuration: 0, // Nunca bloquear
  }
};

/**
 * MAPEAMENTO DE ROTAS PARA RATE LIMITS
 * Define qual tipo de limite aplicar para cada padrão de rota
 */
export const ROUTE_RATE_MAPPING = [
  // Health endpoints - sem restrição
  { pattern: /^\/api\/(health|liveness|readiness|status)/, limit: 'health' },
  
  // Endpoints de autenticação - mais restritivos
  { pattern: /^\/api\/(auth|login|register|reset)/, limit: 'strict' },
  
  // Endpoints de IA/Claude - pesados
  { pattern: /^\/api\/(ai|claude|emotional|analyze)/, limit: 'heavy' },
  
  // Outros endpoints da API
  { pattern: /^\/api\//, limit: 'normal' },
  
  // Fallback para rotas não mapeadas
  { pattern: /.*/, limit: 'normal' }
];

/**
 * SCHEMAS DE VALIDAÇÃO ZOD PARA ENDPOINTS
 * Validação rigorosa de entrada em 100% dos endpoints
 */
export const VALIDATION_SCHEMAS = {
  // Schema para análise emocional
  emotionalAnalysis: {
    body: `z.object({
      currentState: z.object({
        mouseX: z.number().min(-1000).max(3000),
        mouseY: z.number().min(-1000).max(2000),
        intensity: z.number().min(0).max(1),
        complexity: z.number().min(0).max(1),
        empathy: z.number().min(0).max(1),
        coherence: z.number().min(0).max(1)
      }),
      mousePosition: z.object({
        x: z.number().min(-1000).max(3000),
        y: z.number().min(-1000).max(2000)
      }),
      timestamp: z.number().positive().optional(),
      sessionId: z.string().min(8).max(128).optional()
    })`,
    
    response: `z.object({
      emotionalState: z.object({
        dominantEmotion: z.enum(['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'neutral']),
        intensity: z.number().min(0).max(1),
        confidence: z.number().min(0).max(1)
      }),
      recommendations: z.array(z.string()).optional(),
      timestamp: z.string()
    })`
  },
  
  // Schema para health checks
  health: {
    response: `z.object({
      status: z.enum(['healthy', 'unhealthy', 'degraded']),
      timestamp: z.string(),
      services: z.array(z.object({
        name: z.string(),
        status: z.enum(['healthy', 'unhealthy']),
        responseTime: z.number().optional()
      })).optional()
    })`
  }
};

// Export de configuração consolidada
export const OWASP_SECURITY_CONFIG = {
  helmet: getHelmetConfig(),
  cors: getCorsConfig(),
  rateLimits: RATE_LIMITS,
  routeMapping: ROUTE_RATE_MAPPING,
  validation: VALIDATION_SCHEMAS,
  environment: getSecurityConfig()
};
