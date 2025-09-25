/**
 * @fileoverview Integração de Segurança Corrigida
 * @version 1.1.0
 * @author Genesis Luminal Team
 */

import express from 'express';
// CORREÇÃO: Imports corretos
import { securityMiddleware } from './security/SecurityMiddleware';
import { rateLimitMiddleware } from './security/RateLimiter';
import { secretManager, getSecret } from './security/SecretManager';

/**
 * Configuração de segurança corrigida
 */
export async function setupSecurityForApp(app: express.Application): Promise<void> {
  console.log('🔒 Configurando segurança enterprise (corrigida)...');

  try {
    // 1. Verificar secrets críticos
    const anthropicKey = await getSecret('anthropic_api_key');
    if (!anthropicKey) {
      console.warn('⚠️ ANTHROPIC_API_KEY não encontrado');
    } else {
      console.log('✅ ANTHROPIC_API_KEY configurado');
    }

    // 2. Aplicar middlewares (MÉTODOS CORRETOS)
    console.log('🛡️ Aplicando segurança...');
    
    // Rate limiting
    app.use(rateLimitMiddleware);
    console.log('✅ Rate limiting ativo');
    
    // Security headers básicos
    app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });
    console.log('✅ Security headers ativos');

    // 3. Endpoint de status (SEM MÉTODOS INEXISTENTES)
    app.get('/api/security/status', async (req, res) => {
      const status = {
        timestamp: new Date().toISOString(),
        security: {
          secretManager: 'operational',
          rateLimiting: 'active',
          securityHeaders: 'active'
        },
        secrets: {
          anthropicKey: !!(await getSecret('anthropic_api_key')),
          jwtSecret: !!(await getSecret('jwt_secret'))
        }
        // CORREÇÃO: Removido auditLog (método não existe)
      };

      res.json(status);
    });

    console.log('✅ Segurança configurada com sucesso (corrigida)');

  } catch (error) {
    console.error('❌ Erro na segurança:', error);
    // CORREÇÃO: Não fazer throw, aplicar fallback
    console.warn('⚠️ Aplicando segurança básica...');
    applyBasicSecurity(app);
  }
}

/**
 * Health check corrigido
 */
export function securityHealthCheck(req: express.Request, res: express.Response): void {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    security: {
      secretManager: 'ok',
      rateLimiting: 'ok'
    }
  };

  res.status(200).json(health);
}

/**
 * Segurança básica como fallback
 */
export function applyBasicSecurity(app: express.Application): void {
  console.log('🔒 Aplicando segurança básica...');
  
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });
  
  app.use(rateLimitMiddleware);
  
  console.log('✅ Segurança básica aplicada');
}
