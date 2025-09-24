/**
 * @fileoverview Middleware de Segurança Enterprise para Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 * @description Middleware centralizado de segurança com múltiplas camadas de proteção
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { owaspMiddleware } from './OWASPValidator';
import { secretManager } from './SecretManager';

/**
 * @swagger
 * components:
 *   schemas:
 *     SecurityConfig:
 *       type: object
 *       properties:
 *         corsEnabled:
 *           type: boolean
 *         helmetEnabled:
 *           type: boolean
 *         rateLimitEnabled:
 *           type: boolean
 *         owaspValidationEnabled:
 *           type: boolean
 */

interface SecurityConfig {
  corsEnabled: boolean;
  helmetEnabled: boolean;
  rateLimitEnabled: boolean;
  owaspValidationEnabled: boolean;
  allowedOrigins: string[];
  rateLimitWindowMs: number;
  rateLimitMax: number;
}

/**
 * Configuração de segurança baseada no ambiente
 */
const getSecurityConfig = (): SecurityConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    corsEnabled: true,
    helmetEnabled: true,
    rateLimitEnabled: !isDevelopment, // Desabilitado em dev para facilitar testes
    owaspValidationEnabled: true,
    allowedOrigins: isDevelopment 
      ? ['http://localhost:3000', 'http://localhost:3001'] 
      : [process.env.FRONTEND_URL || 'https://genesis-luminal.com'],
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutos
    rateLimitMax: isDevelopment ? 1000 : 100 // Requests por IP por janela
  };
};

/**
 * Middleware de segurança multicamadas
 */
export class SecurityMiddleware {
  private config: SecurityConfig;
  private ipWhitelist: Set<string>;
  private suspiciousIPs: Map<string, { count: number; firstSeen: Date }>;

  constructor() {
    this.config = getSecurityConfig();
    this.ipWhitelist = new Set([
      '127.0.0.1',
      '::1',
      'localhost'
    ]);
    this.suspiciousIPs = new Map();
  }

  /**
   * Configuração completa de CORS
   */
  getCorsMiddleware() {
    return cors({
      origin: (origin, callback) => {
        // Permitir requests sem origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Verificar se origin está na whitelist
        if (this.config.allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Em desenvolvimento, ser mais flexível
        if (process.env.NODE_ENV === 'development') {
          console.warn(`⚠️ CORS: Origin não listado mas permitido (dev): ${origin}`);
          return callback(null, true);
        }

        // Produção: bloquear origins não autorizados
        console.error(`🚫 CORS: Origin bloqueado: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-CSRF-Token',
        'X-API-Key'
      ],
      maxAge: 86400 // 24 horas
    });
  }

  /**
   * Configuração do Helmet para security headers
   */
  getHelmetMiddleware() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://api.anthropic.com"],
          mediaSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: []
        }
      },
      crossOriginEmbedderPolicy: false, // Para compatibilidade com WebGL/Three.js
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    });
  }

  /**
   * Middleware de proteção contra IP suspeitos
   */
  ipProtectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    // IPs na whitelist sempre passam
    if (this.ipWhitelist.has(clientIP)) {
      return next();
    }

    // Verificar se IP é suspeito
    const suspicious = this.suspiciousIPs.get(clientIP);
    if (suspicious) {
      suspicious.count++;
      
      // Bloquear IPs com muitas tentativas suspeitas
      if (suspicious.count > 50) {
        console.warn(`🚫 IP bloqueado por atividade suspeita: ${clientIP}`);
        return res.status(403).json({ 
          error: 'Access denied',
          code: 'IP_BLOCKED'
        });
      }
    }

    next();
  };

  /**
   * Middleware para marcar IP como suspeito
   */
  markSuspiciousIP(ip: string): void {
    if (this.ipWhitelist.has(ip)) return;

    const existing = this.suspiciousIPs.get(ip);
    if (existing) {
      existing.count++;
    } else {
      this.suspiciousIPs.set(ip, {
        count: 1,
        firstSeen: new Date()
      });
    }

    // Limpeza automática de IPs antigos (após 24h)
    this.cleanupSuspiciousIPs();
  }

  /**
   * Limpeza de IPs suspeitos antigos
   */
  private cleanupSuspiciousIPs(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const [ip, data] of this.suspiciousIPs.entries()) {
      if (data.firstSeen < oneDayAgo) {
        this.suspiciousIPs.delete(ip);
      }
    }
  }

  /**
   * Middleware de logging de segurança
   */
  securityLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Log da request
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
      contentType: req.get('Content-Type'),
      contentLength: req.get('Content-Length')
    };

    // Em desenvolvimento, log simples
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔒 ${req.method} ${req.path} - ${logData.ip}`);
    }

    // Override do res.end para capturar resposta
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const duration = Date.now() - startTime;
      
      // Log da response
      const responseLog = {
        ...logData,
        statusCode: res.statusCode,
        duration,
        success: res.statusCode < 400
      };

      // Log detalhado em produção
      if (process.env.NODE_ENV === 'production') {
        console.log('[SECURITY-ACCESS]', JSON.stringify(responseLog));
      }

      // Chamar método original
      originalEnd.call(this, chunk, encoding);
    };

    next();
  };

  /**
   * Middleware para verificar API Key (se necessário)
   */
  apiKeyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Endpoints que não precisam de API Key
    const publicEndpoints = [
      '/api/health',
      '/metrics',
      '/api-docs'
    ];

    if (publicEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
      return next();
    }

    const apiKey = req.get('X-API-Key');
    
    if (!apiKey) {
      // Em desenvolvimento, pode não ter API Key
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ API Key não fornecida - permitido em desenvolvimento');
        return next();
      }

      return res.status(401).json({
        error: 'API Key required',
        code: 'API_KEY_MISSING'
      });
    }

    // Verificar API Key válida
    const validApiKey = await secretManager.getSecret('api_key_public');
    if (apiKey !== validApiKey) {
      this.markSuspiciousIP(req.ip || 'unknown');
      return res.status(401).json({
        error: 'Invalid API Key',
        code: 'API_KEY_INVALID'
      });
    }

    next();
  };

  /**
   * Middleware de emergency shutdown
   */
  emergencyShutdownMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Verificar se sistema está em modo de emergência
    if (process.env.EMERGENCY_SHUTDOWN === 'true') {
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        code: 'MAINTENANCE_MODE'
      });
    }

    next();
  };

  /**
   * Aplica todos os middlewares de segurança na ordem correta
   */
  applySecurityMiddlewares(app: any): void {
    console.log('🔒 Aplicando middlewares de segurança...');

    // 1. Emergency shutdown (primeiro check)
    app.use(this.emergencyShutdownMiddleware);

    // 2. Helmet para security headers
    if (this.config.helmetEnabled) {
      app.use(this.getHelmetMiddleware());
      console.log('✅ Helmet configurado');
    }

    // 3. CORS
    if (this.config.corsEnabled) {
      app.use(this.getCorsMiddleware());
      console.log('✅ CORS configurado');
    }

    // 4. Proteção de IP
    app.use(this.ipProtectionMiddleware);
    console.log('✅ Proteção de IP configurada');

    // 5. Logging de segurança
    app.use(this.securityLoggingMiddleware);
    console.log('✅ Logging de segurança configurado');

    // 6. API Key validation (opcional)
    // app.use(this.apiKeyMiddleware);

    // 7. OWASP Validation (último antes das rotas)
    if (this.config.owaspValidationEnabled) {
      app.use(owaspMiddleware);
      console.log('✅ Validação OWASP configurada');
    }

    console.log('🔒 Todos os middlewares de segurança aplicados');
  }

  /**
   * Status das configurações de segurança
   */
  getSecurityStatus() {
    return {
      config: this.config,
      stats: {
        whitelistedIPs: this.ipWhitelist.size,
        suspiciousIPs: this.suspiciousIPs.size,
        environment: process.env.NODE_ENV
      }
    };
  }
}

/**
 * Instância singleton do SecurityMiddleware
 */
export const securityMiddleware = new SecurityMiddleware();

/**
 * Helper para aplicar segurança em um app Express
 */
export function applySecurityMiddlewares(app: any): void {
  securityMiddleware.applySecurityMiddlewares(app);
}
