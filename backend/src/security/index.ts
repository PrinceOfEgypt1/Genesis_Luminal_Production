/**
 * @fileoverview Security Module Index - Exportações principais
 * @version 1.0.0
 * @author Genesis Luminal Team
 */

export { secretManager, getSecret } from './SecretManager';
export { rateLimiter, rateLimitMiddleware } from './RateLimiter';  
export { securityMiddleware, applyBasicSecurity } from './SecurityMiddleware';

// Função principal para aplicar toda a segurança
export async function setupSecurity(app: any) {
  console.log('🔒 Configurando sistema de segurança...');
  
  try {
    // Aplicar middlewares básicos
    const { applyBasicSecurity } = await import('./SecurityMiddleware');
    applyBasicSecurity(app);
    
    console.log('✅ Sistema de segurança configurado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao configurar segurança:', error);
    return false;
  }
}
