/**
 * @fileoverview Sistema de Rate Limiting Granular Enterprise
 * @version 1.0.0
 * @author Genesis Luminal Team
 * @description Rate limiting inteligente com múltiplas camadas e whitelist
 */

import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request, Response } from 'express';

/**
 * @swagger
 * components:
 *   schemas:
 *     RateLimitConfig:
 *       type: object
 *       properties:
 *         windowMs:
 *           type: integer
 *         max:
 *           type: integer
 *         skipSuccessfulRequests:
 *           type: boolean
 *         skipFailedRequests:
 *           type: boolean
 */

interface RateLimitRule {
  path: string;
  windowMs: number;
  max: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
  skipIf?: (req: Request) => boolean;
}

/**
 * Sistema de Rate Limiting Enterprise com regras granulares
 */
export class EnterpriseRateLimiter {
  private defaultConfig: RateLimitRule;
  private rules: Map<string, RateLimitRequestHandler>;
  private whitelistedIPs: Set<string>;
  private whitelistedPaths: Set<string>;

  constructor() {
    this.defaultConfig = {
      path: '*',
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // requests por IP
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    };

    this.rules = new Map();
    this.initializeWhitelists();
    this.initializeRules();
  }

  /**
   * Inicializa listas de IPs e paths sem rate limit
   */
  private initializeWhitelists(): void {
    // IPs sem rate limit (localhost, monitoramento, etc.)
    this.whitelistedIPs = new Set([
      '127.0.0.1',
      '::1',
      'localhost',
      // Adicionar IPs de monitoramento/load balancer aqui
    ]);

    // Paths que NUNCA devem ser limitados (críticos para funcionamento)
    this.whitelistedPaths = new Set([
      '/api/health',
      '/api/readiness',
      '/api/liveness',
      '/metrics'
    ]);
  }

  /**
   * Inicializa regras específicas por endpoint
   */
  private initializeRules(): void {
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Regras específicas para diferentes tipos de endpoint
    const ruleDefinitions: RateLimitRule[] = [
      // Health checks - sem limite
      {
        path: '/api/health',
        windowMs: 1000,
        max: 1000, // Praticamente ilimitado
        skipSuccessfulRequests: true,
        message: 'Health check rate limit should never trigger'
      },

      // Métricas - sem limite para Prometheus
      {
        path: '/metrics',
        windowMs: 1000,
        max: 1000,
        skipSuccessfulRequests: true,
        message: 'Metrics should not be rate limited'
      },

      // API de emoções - limite moderado
      {
        path: '/api/emotions',
        windowMs: 1 * 60 * 1000, // 1 minuto
        max: isDevelopment ? 1000 : 60, // 60 requests por minuto por IP
        skipSuccessfulRequests: false,
        message: 'Too many emotion analysis requests. Please wait before trying again.'
      },

      // API de morphing - limite alto (uso intensivo esperado)
      {
        path: '/api/morphing',
        windowMs: 1 * 60 * 1000,
        max: isDevelopment ? 1000 : 120, // 120 requests por minuto
        skipSuccessfulRequests: true, // Não contar sucesso
        message: 'Morphing rate limit exceeded. Please slow down.'
      },

      // API de áudio - limite moderado
      {
        path: '/api/audio',
        windowMs: 5 * 60 * 1000, // 5 minutos
        max: isDevelopment ? 1000 : 100,
        skipSuccessfulRequests: false,
        message: 'Audio synthesis rate limited. Please wait.'
      },

      // Endpoints de administração - limite muito restrito
      {
        path: '/api/admin',
        windowMs: 15 * 60 * 1000,
        max: isDevelopment ? 1000 : 10, // Apenas 10 por 15 minutos
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        message: 'Admin endpoint access limited. Contact administrator if needed.'
      },

      // Upload de arquivos - limite baixo
      {
        path: '/api/upload',
        windowMs: 10 * 60 * 1000, // 10 minutos
        max: isDevelopment ? 1000 : 5,
        skipSuccessfulRequests: false,
        message: 'File upload rate limited. Please wait before uploading again.'
      },

      // Endpoints de autenticação - muito restrito
      {
        path: '/api/auth',
        windowMs: 15 * 60 * 1000,
        max: isDevelopment ? 1000 : 5, // Apenas 5 tentativas por 15 min
        skipSuccessfulRequests: true, // Não contar logins bem-sucedidos
        skipFailedRequests: false, // Contar falhas para prevenir brute force
        message: 'Too many authentication attempts. Account may be locked.'
      }
    ];

    // Criar rate limiters para cada regra
    ruleDefinitions.forEach(rule => {
      const limiter = this.createRateLimiter(rule);
      this.rules.set(rule.path, limiter);
    });

    console.log(`✅ Rate Limiting configurado para ${this.rules.size} regras específicas`);
  }

  /**
   * Cria rate limiter com configuração específica
   */
  private createRateLimiter(rule: RateLimitRule): RateLimitRequestHandler {
    return rateLimit({
      windowMs: rule.windowMs,
      max: rule.max,
      skipSuccessfulRequests: rule.skipSuccessfulRequests || false,
      skipFailedRequests: rule.skipFailedRequests || false,
      
      // Função de skip customizada
      skip: (req: Request) => {
        // Skip IPs na whitelist
        const clientIP = req.ip || req.connection.remoteAddress;
        if (clientIP && this.whitelistedIPs.has(clientIP)) {
          return true;
        }

        // Skip paths na whitelist
        if (this.whitelistedPaths.has(req.path)) {
          return true;
        }

        // Skip customizado da regra
        if (rule.skipIf && rule.skipIf(req)) {
          return true;
        }

        return false;
      },

      // Mensagem customizada
      message: {
        error: rule.message || 'Rate limit exceeded',
        retryAfter: Math.ceil(rule.windowMs / 1000),
        limit: rule.max,
        window: rule.windowMs
      },

      // Headers informativos
      standardHeaders: true,
      legacyHeaders: false,

      // Função chamada quando limite é atingido
      onLimitReached: (req: Request) => {
        console.warn(`🚨 Rate limit atingido: ${rule.path}`, {
          ip: req.ip,
          path: req.path,
          method: req.method,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  /**
   * Cria slow down middleware para degradar performance gradualmente
   */
  createSlowDown(path: string = '*'): any {
    const isDevelopment = process.env.NODE_ENV === 'development';

    return slowDown({
      windowMs: 15 * 60 * 1000, // 15 minutos
      delayAfter: isDevelopment ? 1000 : 10, // Começar delay após N requests
      delayMs: 100, // Aumentar 100ms a cada request
      maxDelayMs: 5000, // Máximo 5 segundos de delay

      skip: (req: Request) => {
        const clientIP = req.ip || req.connection.remoteAddress;
        return clientIP ? this.whitelistedIPs.has(clientIP) : false;
      },

      onLimitReached: (req: Request) => {
        console.warn(`⏱️ Slow down ativado: ${path}`, {
          ip: req.ip,
          path: req.path,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  /**
   * Obtém rate limiter para path específico
   */
  getLimiterForPath(path: string): RateLimitRequestHandler | null {
    // Procurar match exato primeiro
    if (this.rules.has(path)) {
      return this.rules.get(path)!;
    }

    // Procurar por prefixos (ex: /api/admin/users matches /api/admin)
    for (const [rulePath, limiter] of this.rules.entries()) {
      if (path.startsWith(rulePath)) {
        return limiter;
      }
    }

    return null;
  }

  /**
   * Rate limiter padrão para paths não especificados
   */
  getDefaultLimiter(): RateLimitRequestHandler {
    if (!this.rules.has('default')) {
      const defaultLimiter = this.createRateLimiter({
        ...this.defaultConfig,
        path: 'default',
        max: process.env.NODE_ENV === 'development' ? 1000 : 100
      });
      this.rules.set('default', defaultLimiter);
    }

    return this.rules.get('default')!;
  }

  /**
   * Middleware que aplica rate limiting baseado no path
   */
  getSmartRateLimitMiddleware() {
    return (req: Request, res: Response, next: Function) => {
      // Verificar se path está na whitelist
      if (this.whitelistedPaths.has(req.path)) {
        return next();
      }

      // Obter limiter apropriado
      const limiter = this.getLimiterForPath(req.path) || this.getDefaultLimiter();
      
      // Aplicar rate limiting
      return limiter(req, res, next);
    };
  }

  /**
   * Adiciona IP à whitelist dinamicamente
   */
  addWhitelistedIP(ip: string): void {
    this.whitelistedIPs.add(ip);
    console.log(`✅ IP adicionado à whitelist: ${ip}`);
  }

  /**
   * Remove IP da whitelist
   */
  removeWhitelistedIP(ip: string): void {
    this.whitelistedIPs.delete(ip);
    console.log(`❌ IP removido da whitelist: ${ip}`);
  }

  /**
   * Status atual do rate limiting
   */
  getStatus() {
    return {
      rules: Array.from(this.rules.keys()),
      whitelistedIPs: Array.from(this.whitelistedIPs),
      whitelistedPaths: Array.from(this.whitelistedPaths),
      environment: process.env.NODE_ENV
    };
  }
}

/**
 * Instância singleton do EnterpriseRateLimiter
 */
export const rateLimiter = new EnterpriseRateLimiter();

/**
 * Middleware principal de rate limiting
 */
export const rateLimitMiddleware = rateLimiter.getSmartRateLimitMiddleware();

/**
 * Slow down middleware
 */
export const slowDownMiddleware = rateLimiter.createSlowDown();

/**
 * Helper para aplicar rate limiting em rotas específicas
 */
export function applyRateLimiting(app: any): void {
  console.log('⏱️ Aplicando rate limiting...');
  
  // Aplicar slow down global (não afeta health checks)
  app.use(slowDownMiddleware);
  
  // Aplicar rate limiting inteligente
  app.use(rateLimitMiddleware);
  
  console.log('✅ Rate limiting configurado');
}
