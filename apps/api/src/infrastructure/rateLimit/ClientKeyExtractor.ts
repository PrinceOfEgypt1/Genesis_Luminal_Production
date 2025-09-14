/**
 * TRILHO B AÇÃO 6 - Client Key Extractor
 * 
 * Extração segura de chave de cliente para rate limiting
 */

import { Request } from 'express';
import { IClientKeyExtractor } from '../interfaces/IRateLimiter';

export class ExpressClientKeyExtractor implements IClientKeyExtractor {
  extractKey(req: Request): string {
    // Prioridade: X-Forwarded-For > X-Real-IP > req.ip > socket.remoteAddress
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    
    let clientIp: string;

    if (Array.isArray(forwardedFor)) {
      clientIp = forwardedFor[0] || '';
    } else if (typeof forwardedFor === 'string') {
      clientIp = forwardedFor.split(',')[0] || '';
    } else if (typeof realIp === 'string') {
      clientIp = realIp;
    } else {
      clientIp = req.ip || (req.socket as any)?.remoteAddress || 'unknown';
    }

    // Limpar e sanitizar IP
    return this.sanitizeIp(clientIp.trim());
  }

  private sanitizeIp(ip: string): string {
    // Remove espaços e caracteres inválidos
    const cleaned = ip.replace(/[^0-9a-fA-F:.]/g, '');
    
    // Validação básica de formato IP
    if (this.isValidIp(cleaned)) {
      return cleaned;
    }
    
    return 'invalid_ip';
  }

  private isValidIp(ip: string): boolean {
    // IPv4 regex
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    // IPv6 regex (simplificado)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip === 'localhost' || ip === '127.0.0.1';
  }
}
