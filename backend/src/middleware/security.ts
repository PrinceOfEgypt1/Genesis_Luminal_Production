/**
 * GENESIS LUMINAL - MIDDLEWARE DE SEGURANÇA AVANÇADO [CORRIGIDO]
 * Implementa controles de segurança OWASP Top 10 2023
 * 
 * Funcionalidades:
 * - Helmet com políticas rigorosas
 * - CORS restrito por ambiente  
 * - Rate limiting granular por rota
 * - Validação de entrada robusta
 * - Logging de segurança
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { OWASP_SECURITY_CONFIG } from '../config/security';
import { logger } from '../utils/logger';

/**
 * HELMET COM POLÍTICAS RIGOROSAS OWASP
 * Aplica todos os cabeçalhos de segurança necessários
 */
export const securityHeaders = helmet(OWASP_SECURITY_CONFIG.helmet);

/**
 * CORS RESTRITO POR AMBIENTE
 * Whitelist rigorosa baseada no NODE_ENV
 */
export const securedCors = cors(OWASP_SECURITY_CONFIG.cors);

/**
 * MIDDLEWARE DE LOGGING DE SEGURANÇA [CORRIGIDO]
 * Registra tentativas de acesso e violações
 */
export function securityLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  
  // Log de request de entrada
  logger.info('Security audit trail', {
    type: 'request_start',
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    origin: req.get('Origin'),
    referer: req.get('Referer'),
    timestamp: new Date().toISOString()
  });

  // Interceptar response para logging
  const originalJson = res.json;
  res.json = function(body: any) {
    const responseTime = Date.now() - startTime;
    
    // Log de response de saída
    logger.info('Security audit trail', {
      type: 'request_complete',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    // Log de errors de segurança
    if (res.statusCode >= 400) {
      logger.warn('Security event detected', {
        type: 'error_response',
        statusCode: res.statusCode,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
    }

    return originalJson.call(this, body);
  };

  // ✅ CORREÇÃO: Sempre chamar next()
  next();
}

/**
 * MIDDLEWARE DE SANITIZAÇÃO DE REQUEST [CORRIGIDO]
 * Remove/sanitiza dados potencialmente perigosos
 */
export function requestSanitizer(req: Request, res: Response, next: NextFunction): void {
  try {
    // Sanitizar query parameters
    if (req.query) {
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
          // Remove caracteres perigosos
          req.query[key] = value
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
            .replace(/javascript:/gi, '') // Remove javascript: URLs
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
            .trim();
        }
      }
    }

    // Sanitizar body (se não foi validado ainda)
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }

    // ✅ CORREÇÃO: Sempre chamar next() no caminho de sucesso
    next();
  } catch (error) {
    logger.error('Request sanitization failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: req.url,
      method: req.method,
      ip: req.ip
    });
    
    // ✅ CORREÇÃO: Return após enviar resposta de erro
    res.status(400).json({
      error: 'Invalid request format',
      message: 'Request could not be processed safely'
    });
    return; // Explicit return para TypeScript
  }
}

/**
 * Função auxiliar para sanitização recursiva de objetos
 */
function sanitizeObject(obj: any): void {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
          .trim();
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    }
  }
}

/**
 * MIDDLEWARE DE DETECÇÃO DE ATAQUES [CORRIGIDO]
 * Detecta padrões suspeitos e bloqueia requests maliciosos
 */
export function attackDetection(req: Request, res: Response, next: NextFunction): void {
  const suspiciousPatterns = [
    // SQL Injection patterns
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND)\b)/i,
    /(\'|\"|`|;|--|\|\|)/,
    
    // XSS patterns
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/i,
    /on\w+\s*=/i,
    
    // Path traversal
    /\.\.\//,
    /\.\.\\/,
    
    // Command injection
    /(\||&|;|`|\$\(|\$\{)/,
  ];

  const fullRequest = JSON.stringify({
    url: req.url,
    query: req.query,
    body: req.body,
    headers: req.headers
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fullRequest)) {
      logger.warn('Potential attack detected', {
        type: 'attack_pattern',
        pattern: pattern.toString(),
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      // ✅ CORREÇÃO: Return após enviar resposta de bloqueio
      res.status(403).json({
        error: 'Forbidden',
        message: 'Request blocked by security policy'
      });
      return; // Explicit return para TypeScript
    }
  }

  // ✅ CORREÇÃO: Sempre chamar next() se não detectou ataques
  next();
}

/**
 * MIDDLEWARE DE TIMEOUT DE SEGURANÇA [CORRIGIDO]
 * Previne ataques de resource exhaustion
 */
export function securityTimeout(timeoutMs: number = 30000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn('Request timeout triggered', {
          type: 'security_timeout',
          url: req.url,
          method: req.method,
          ip: req.ip,
          timeout: timeoutMs
        });

        res.status(408).json({
          error: 'Request Timeout',
          message: `Request exceeded ${timeoutMs}ms security limit`
        });
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));
    
    // ✅ CORREÇÃO: Sempre chamar next()
    next();
  };
}

/**
 * MIDDLEWARE CONSOLIDADO DE SEGURANÇA
 * Aplica todas as proteções em ordem correta
 */
export function applySecurity() {
  return [
    securityTimeout(30000),
    securityLogger,
    securityHeaders,
    securedCors,
    requestSanitizer,
    attackDetection
  ];
}
