/**
 * @fileoverview OWASP Validator Corrigido
 * @version 1.1.0
 * @author Genesis Luminal Team
 */

import { Request, Response, NextFunction } from 'express';

// CORREÇÃO: Interface estendida para Request
interface ExtendedRequest extends Request {
  user?: any;
  sessionID?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * OWASP Validator com propriedades inicializadas
 */
export class OWASPValidator {
  // CORREÇÃO: Propriedades inicializadas
  private suspiciousPatterns: RegExp[];
  private blockedUserAgents: RegExp[];
  private maxRequestSize: number = 1024 * 1024;

  constructor() {
    // CORREÇÃO: Inicializar no constructor
    this.suspiciousPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b)/i,
      /(<script[^>]*>.*?<\/script>)/gi,
      /(javascript\s*:)/gi,
      /(on\w+\s*=)/gi,
      /(\.\.\/|\.\.\\)/gi
    ];

    this.blockedUserAgents = [
      /sqlmap/i,
      /nikto/i,
      /burp/i,
      /nmap/i
    ];
  }

  /**
   * Validação com tipos corretos
   */
  async validateRequest(req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verificar tamanho
      const requestSize = JSON.stringify(req.body || {}).length;
      if (requestSize > this.maxRequestSize) {
        this.logSecurityEvent('request_too_large', req, 'critical');
        res.status(413).json({ error: 'Request too large' });
        return;
      }

      // Verificar User-Agent
      const userAgent = req.get('User-Agent') || '';
      if (this.isBlockedUserAgent(userAgent)) {
        this.logSecurityEvent('blocked_user_agent', req, 'high');
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      // Headers de segurança
      this.addSecurityHeaders(res);
      
      // Log
      this.logSecurityEvent('request_validated', req, 'low');

      next();
      
    } catch (error) {
      this.logSecurityEvent('validation_error', req, 'critical');
      console.error('Validation error:', error);
      res.status(500).json({ error: 'Internal error' });
    }
  }

  /**
   * Verificar User-Agent bloqueado
   */
  private isBlockedUserAgent(userAgent: string): boolean {
    return this.blockedUserAgents.some(pattern => pattern.test(userAgent));
  }

  /**
   * Headers de segurança
   */
  private addSecurityHeaders(res: Response): void {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }

  /**
   * Log com tipos corretos
   */
  private logSecurityEvent(
    event: string, 
    req: ExtendedRequest, 
    severity: ValidationResult['riskLevel']
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      severity,
      ip: req.ip,
      method: req.method,
      path: req.path,
      // CORREÇÃO: Usar propriedades opcionais
      authenticated: !!req.user,
      sessionId: req.sessionID || 'no-session'
    };

    console.log(`[SECURITY-${severity.toUpperCase()}]`, JSON.stringify(logEntry));
  }
}

/**
 * Instância e middleware
 */
export const owaspValidator = new OWASPValidator();

export const owaspMiddleware = (req: Request, res: Response, next: NextFunction) => {
  return owaspValidator.validateRequest(req as ExtendedRequest, res, next);
};
