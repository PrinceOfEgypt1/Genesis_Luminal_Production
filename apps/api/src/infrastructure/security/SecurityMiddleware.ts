/**
 * TRILHO B AÇÃO 6 - Security Middleware
 * 
 * Configuração centralizada de middleware de segurança
 * Separação clara de responsabilidades CORS/Helmet
 */

import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { ISecurityMiddleware, ISecurityConfig, ICorsConfig, IHelmetConfig } from '../interfaces/ISecurityMiddleware';
import { logger } from '../../utils/logger';

export class SecurityMiddleware implements ISecurityMiddleware {
  private readonly defaultConfig: ISecurityConfig = {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      maxAge: 86400 // 24 horas
    },
    helmet: {
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
          frameSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: false, // Compatibilidade com algumas APIs
      hsts: {
        maxAge: 31536000, // 1 ano
        includeSubDomains: true,
        preload: true
      }
    },
    trustProxy: true,
    requestSizeLimit: '1mb',
    requestTimeout: 15000
  };

  configure(config: Partial<ISecurityConfig> = {}): any[] {
    const effectiveConfig = this.mergeConfig(config);
    
    if (!this.validateConfig(effectiveConfig)) {
      throw new Error('Invalid security configuration');
    }

    logger.info('Configuring security middleware', {
      corsOrigin: effectiveConfig.cors.origin,
      requestLimit: effectiveConfig.requestSizeLimit,
      timeout: effectiveConfig.requestTimeout
    });

    const middlewares = [];

    // Compression (antes de tudo)
    middlewares.push(compression());

    // CORS
    middlewares.push(this.getCorsMiddleware(effectiveConfig.cors));

    // Helmet
    middlewares.push(this.getHelmetMiddleware(effectiveConfig.helmet));

    return middlewares;
  }

  getCorsMiddleware(config?: ICorsConfig) {
    const corsConfig = config || this.defaultConfig.cors;
    
    return cors({
      origin: corsConfig.origin,
      credentials: corsConfig.credentials,
      methods: corsConfig.methods,
      allowedHeaders: corsConfig.allowedHeaders,
      exposedHeaders: corsConfig.exposedHeaders,
      maxAge: corsConfig.maxAge,
      optionsSuccessStatus: 200 // Para compatibilidade com browsers antigos
    });
  }

  getHelmetMiddleware(config?: IHelmetConfig) {
    const helmetConfig = config || this.defaultConfig.helmet;
    
    return helmet({
      ...helmetConfig,
      // Configurações específicas para desenvolvimento vs produção
      contentSecurityPolicy: process.env.NODE_ENV === 'development' 
        ? false 
        : helmetConfig.contentSecurityPolicy
    });
  }

  validateConfig(config: ISecurityConfig): boolean {
    try {
      // Validar CORS
      if (!config.cors || !config.cors.origin) {
        logger.error('Invalid CORS configuration: origin is required');
        return false;
      }

      // Validar request size limit
      if (config.requestSizeLimit && !/^\d+[kmg]?b$/i.test(config.requestSizeLimit)) {
        logger.error('Invalid request size limit format', { limit: config.requestSizeLimit });
        return false;
      }

      // Validar timeout
      if (config.requestTimeout && (config.requestTimeout < 1000 || config.requestTimeout > 60000)) {
        logger.error('Request timeout must be between 1000-60000ms', { timeout: config.requestTimeout });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Security config validation failed', { error });
      return false;
    }
  }

  private mergeConfig(userConfig: Partial<ISecurityConfig>): ISecurityConfig {
    return {
      cors: { ...this.defaultConfig.cors, ...userConfig.cors },
      helmet: { ...this.defaultConfig.helmet, ...userConfig.helmet },
      trustProxy: userConfig.trustProxy ?? this.defaultConfig.trustProxy,
      requestSizeLimit: userConfig.requestSizeLimit ?? this.defaultConfig.requestSizeLimit,
      requestTimeout: userConfig.requestTimeout ?? this.defaultConfig.requestTimeout
    };
  }
}

// Factory function
export function createSecurityMiddleware(): ISecurityMiddleware {
  return new SecurityMiddleware();
}

// Helper para configuração rápida por ambiente
export function getEnvironmentSecurityConfig(): Partial<ISecurityConfig> {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isProduction) {
    return {
      cors: {
        origin: process.env.FRONTEND_URL || false, // Restritivo em produção
        credentials: true
      },
      helmet: {
        contentSecurityPolicy: true, // Habilitado em produção
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        }
      },
      requestTimeout: 10000 // Mais restritivo em produção
    };
  }

  if (isDevelopment) {
    return {
      cors: {
        origin: true, // Permissivo em desenvolvimento
        credentials: true
      },
      helmet: {
        contentSecurityPolicy: false // Desabilitado em desenvolvimento
      },
      requestTimeout: 30000 // Mais permissivo em desenvolvimento
    };
  }

  return {}; // Default config
}
