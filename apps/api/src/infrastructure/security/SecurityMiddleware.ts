/**
 * TRILHO B AÇÃO 6 - Security Middleware Simplificado
 * 
 * Versão funcional e compatível
 */

import cors = require('cors');
import helmet = require('helmet');
import compression = require('compression');
import { logger } from '../../utils/logger';

export interface SecurityConfig {
  corsOrigin?: string;
  enableCSP?: boolean;
  enableHSTS?: boolean;
}

export class SecurityMiddleware {
  static configure(config: SecurityConfig = {}) {
    const middlewares = [];

    // Compression
    middlewares.push(compression());

    // CORS
    middlewares.push(cors({
      origin: config.corsOrigin || process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }));

    // Helmet
    middlewares.push(helmet({
      contentSecurityPolicy: config.enableCSP ?? (process.env.NODE_ENV === 'production'),
      hsts: config.enableHSTS ?? (process.env.NODE_ENV === 'production')
    }));

    logger.info('Security middleware configured', {
      corsOrigin: config.corsOrigin,
      cspEnabled: config.enableCSP,
      hstsEnabled: config.enableHSTS
    });

    return middlewares;
  }
}
