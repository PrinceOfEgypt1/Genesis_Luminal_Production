/**
 * Security Middleware - Infraestrutura Crosscutting
 * TRILHO B - Ação 6: Separar Infraestrutura Crosscutting
 * 
 * Centraliza configurações de segurança (CORS, Helmet, etc.)
 * seguindo Single Responsibility Principle (SRP) do SOLID
 */

import { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

/**
 * Configurações de CORS baseadas no ambiente
 */
interface CorsConfig {
  origin: string | string[] | boolean;
  credentials: boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  maxAge?: number;
}

/**
 * Configurações do Helmet para segurança
 */
interface HelmetConfig {
  contentSecurityPolicy?: any;
  crossOriginEmbedderPolicy?: boolean;
  crossOriginOpenerPolicy?: boolean;
  crossOriginResourcePolicy?: any;
  dnsPrefetchControl?: boolean;
  frameguard?: any;
  hidePoweredBy?: boolean;
  hsts?: any;
  ieNoOpen?: boolean;
  noSniff?: boolean;
  originAgentCluster?: boolean;
  permittedCrossDomainPolicies?: boolean;
  referrerPolicy?: any;
  xssFilter?: boolean;
}

/**
 * Classe responsável por configurar middleware de segurança
 */
export class SecurityMiddleware {
  private static readonly DEFAULT_CORS_CONFIG: CorsConfig = {
    origin: config.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Request-ID'],
    maxAge: 86400 // 24 horas
  };

  private static readonly DEFAULT_HELMET_CONFIG: HelmetConfig = {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Para compatibilidade com embeddings
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000, // 1 ano
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    ieNoOpen: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  };

  /**
   * Aplica middleware de segurança na aplicação Express
   * @param app Instância do Express
   * @param corsConfig Configurações customizadas de CORS (opcional)
   * @param helmetConfig Configurações customizadas do Helmet (opcional)
   */
  public static apply(
    app: Express,
    corsConfig?: Partial<CorsConfig>,
    helmetConfig?: Partial<HelmetConfig>
  ): void {
    logger.info('🛡️ Aplicando middleware de segurança...');

    // 1. Helmet - Configurações de segurança HTTP
    const finalHelmetConfig = {
      ...SecurityMiddleware.DEFAULT_HELMET_CONFIG,
      ...helmetConfig
    };
    
    app.use(helmet(finalHelmetConfig));
    logger.info('✅ Helmet configurado com políticas de segurança');

    // 2. Compression - Otimização de performance
    app.use(compression({
      level: 6, // Balanço entre velocidade e compressão
      threshold: 1024, // Só comprimir arquivos > 1KB
      filter: (req, res) => {
        // Não comprimir se cliente não suporta
        if (req.headers['x-no-compression']) {
          return false;
        }
        // Usar filtro padrão do compression
        return compression.filter(req, res);
      }
    }));
    logger.info('✅ Compression configurado');

    // 3. CORS - Configuração cross-origin
    const finalCorsConfig = {
      ...SecurityMiddleware.DEFAULT_CORS_CONFIG,
      ...corsConfig
    };

    app.use(cors(finalCorsConfig));
    logger.info(`✅ CORS configurado - Origin: ${finalCorsConfig.origin}`);

    // 4. Log de segurança aplicada
    logger.info('🔒 Middleware de segurança aplicado com sucesso');
    logger.info(`🌐 CORS Origin: ${finalCorsConfig.origin}`);
    logger.info(`🛡️ Helmet CSP: ${finalHelmetConfig.contentSecurityPolicy ? 'Ativo' : 'Inativo'}`);
    logger.info(`📦 Compression: Ativo (threshold: 1KB)`);
  }

  /**
   * Configurações específicas para desenvolvimento
   */
  public static forDevelopment(): { corsConfig: Partial<CorsConfig>; helmetConfig: Partial<HelmetConfig> } {
    return {
      corsConfig: {
        origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
        credentials: true
      },
      helmetConfig: {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-eval'"], // Para hot reload
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "ws:", "wss:"], // Para WebSocket do dev server
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        }
      }
    };
  }

  /**
   * Configurações específicas para produção
   */
  public static forProduction(): { corsConfig: Partial<CorsConfig>; helmetConfig: Partial<HelmetConfig> } {
    return {
      corsConfig: {
        origin: config.FRONTEND_URL || false, // Apenas origem específica
        credentials: true
      },
      helmetConfig: {
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
        hsts: {
          maxAge: 31536000, // 1 ano
          includeSubDomains: true,
          preload: true
        }
      }
    };
  }

  /**
   * Middleware para adicionar headers de segurança customizados
   */
  public static customSecurityHeaders() {
    return (req: any, res: any, next: any) => {
      // Request ID para tracking
      req.id = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      res.setHeader('X-Request-ID', req.id);

      // Timestamp da request
      res.setHeader('X-Response-Time', Date.now().toString());

      // Headers de segurança adicionais
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

      next();
    };
  }
}

export default SecurityMiddleware;
