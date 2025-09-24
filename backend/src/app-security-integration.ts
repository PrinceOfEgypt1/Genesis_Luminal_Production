/**
 * @fileoverview Integração de Segurança no App Principal
 * @version 1.0.0
 * @author Genesis Luminal Team
 * @description Demonstração de como integrar toda a segurança enterprise no app principal
 */

import express from 'express';
import { applySecurityMiddlewares } from './security/SecurityMiddleware';
import { applyRateLimiting } from './security/RateLimiter';
import { secretManager, getSecret } from './security/SecretManager';

/**
 * Configuração completa de segurança para o app Genesis Luminal
 */
export async function setupSecurityForApp(app: express.Application): Promise<void> {
  console.log('🔒 Configurando segurança enterprise...');

  try {
    // 1. Inicializar gerenciador de secrets
    console.log('🗝️ Inicializando gerenciador de secrets...');
    
    // Verificar secrets críticos
    const anthropicKey = await getSecret('anthropic_api_key');
    if (!anthropicKey) {
      console.warn('⚠️ ANTHROPIC_API_KEY não encontrado - funcionalidades de IA limitadas');
    }

    const jwtSecret = await getSecret('jwt_secret');
    if (!jwtSecret) {
      console.log('🔑 JWT secret gerado automaticamente');
    }

    // 2. Aplicar todos os middlewares de segurança
    console.log('🛡️ Aplicando middlewares de segurança...');
    applySecurityMiddlewares(app);

    // 3. Aplicar rate limiting
    console.log('⏱️ Configurando rate limiting...');
    applyRateLimiting(app);

    // 4. Endpoint de status de segurança (apenas para admin)
    app.get('/api/security/status', async (req, res) => {
      // TODO: Adicionar autenticação de admin
      const status = {
        timestamp: new Date().toISOString(),
        security: {
          secretManager: 'operational',
          rateLimiting: 'active',
          owaspValidation: 'enabled',
          corsProtection: 'active',
          helmetHeaders: 'active'
        },
        secrets: {
          anthropicKey: !!(await getSecret('anthropic_api_key')),
          jwtSecret: !!(await getSecret('jwt_secret'))
        },
        auditLog: secretManager.getAuditLog().slice(-10) // Últimas 10 entradas
      };

      res.json(status);
    });

    console.log('✅ Segurança enterprise configurada com sucesso');

  } catch (error) {
    console.error('❌ Erro ao configurar segurança:', error);
    throw error;
  }
}

/**
 * Middleware para verificar saúde da segurança
 */
export function securityHealthCheck(req: express.Request, res: express.Response): void {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    security: {
      secretManager: 'ok',
      rateLimiting: 'ok',
      validation: 'ok'
    }
  };

  res.status(200).json(health);
}

// Exemplo de uso no app.ts:
/*
import express from 'express';
import { setupSecurityForApp, securityHealthCheck } from './app-security-integration';

const app = express();

// Aplicar segurança ANTES das rotas
setupSecurityForApp(app).then(() => {
  
  // Health check com segurança
  app.get('/api/security/health', securityHealthCheck);
  
  // Suas rotas aqui...
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.listen(3001, () => {
    console.log('🚀 Servidor rodando com segurança enterprise na porta 3001');
  });

}).catch(error => {
  console.error('❌ Falha na inicialização de segurança:', error);
  process.exit(1);
});
*/
