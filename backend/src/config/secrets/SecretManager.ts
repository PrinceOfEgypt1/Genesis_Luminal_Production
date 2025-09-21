/**
 * @fileoverview Secret Manager - Genesis Luminal
 * @version 1.0.0
 * @author Genesis Luminal Team
 * 
 * Gerenciamento seguro de secrets com fallback para desenvolvimento
 */

import { createHash } from 'crypto';

/**
 * Tipos de secrets suportados
 */
export enum SecretType {
  API_KEY = 'API_KEY',
  DATABASE_URL = 'DATABASE_URL',
  JWT_SECRET = 'JWT_SECRET',
  ENCRYPTION_KEY = 'ENCRYPTION_KEY'
}

/**
 * Interface para provedores de secrets
 */
interface SecretProvider {
  getSecret(key: string): Promise<string | null>;
  isAvailable(): Promise<boolean>;
}

/**
 * Provider para AWS Secrets Manager
 */
class AWSSecretsProvider implements SecretProvider {
  async getSecret(key: string): Promise<string | null> {
    // TODO: Implementar AWS Secrets Manager
    // Requer: npm install @aws-sdk/client-secrets-manager
    console.log('🔐 [AWS] Getting secret:', key);
    return null; // Não implementado ainda
  }
  
  async isAvailable(): Promise<boolean> {
    return false; // AWS SDK não configurado
  }
}

/**
 * Provider para Azure Key Vault
 */
class AzureKeyVaultProvider implements SecretProvider {
  async getSecret(key: string): Promise<string | null> {
    // TODO: Implementar Azure Key Vault
    // Requer: npm install @azure/keyvault-secrets
    console.log('🔐 [Azure] Getting secret:', key);
    return null; // Não implementado ainda
  }
  
  async isAvailable(): Promise<boolean> {
    return false; // Azure SDK não configurado
  }
}

/**
 * Provider para desenvolvimento (environment variables)
 * ⚠️ APENAS PARA DESENVOLVIMENTO - NÃO USAR EM PRODUÇÃO
 */
class DevelopmentProvider implements SecretProvider {
  async getSecret(key: string): Promise<string | null> {
    const value = process.env[key];
    
    if (value) {
      console.warn('🟡 [DEV] Using environment variable for secret:', key);
      console.warn('⚠️  WARNING: Not secure for production use');
    }
    
    return value || null;
  }
  
  async isAvailable(): Promise<boolean> {
    return true; // Sempre disponível
  }
}

/**
 * Manager principal para secrets
 */
export class SecretManager {
  private providers: SecretProvider[] = [];
  private cache = new Map<string, { value: string; expiry: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutos
  
  constructor() {
    this.initializeProviders();
  }
  
  /**
   * Inicializa provedores baseado no ambiente
   */
  private initializeProviders(): void {
    const env = process.env.NODE_ENV || 'development';
    
    if (env === 'production') {
      // Prioridade: AWS > Azure > Dev (fallback)
      this.providers = [
        new AWSSecretsProvider(),
        new AzureKeyVaultProvider(),
        new DevelopmentProvider() // Fallback apenas
      ];
      
      console.log('🔐 SecretManager: Production mode - using cloud providers');
    } else {
      // Desenvolvimento: apenas environment variables
      this.providers = [new DevelopmentProvider()];
      
      console.log('🔐 SecretManager: Development mode - using environment variables');
    }
  }
  
  /**
   * Obtém um secret de forma segura
   */
  async getSecret(key: string): Promise<string | null> {
    // Verificar cache primeiro
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.value;
    }
    
    // Tentar cada provider
    for (const provider of this.providers) {
      try {
        if (await provider.isAvailable()) {
          const value = await provider.getSecret(key);
          if (value) {
            // Cache por tempo limitado
            this.cache.set(key, {
              value,
              expiry: Date.now() + this.cacheTimeout
            });
            
            return value;
          }
        }
      } catch (error) {
        console.error(`🔐 Error getting secret ${key} from provider:`, error);
        continue; // Tentar próximo provider
      }
    }
    
    return null;
  }
  
  /**
   * Obtém secret obrigatório (falha se não encontrar)
   */
  async getRequiredSecret(key: string): Promise<string> {
    const value = await this.getSecret(key);
    
    if (!value) {
      throw new Error(`Required secret not found: ${key}`);
    }
    
    return value;
  }
  
  /**
   * Verifica se um secret está configurado
   */
  async isSecretConfigured(key: string): Promise<boolean> {
    const value = await this.getSecret(key);
    return value !== null && value.length > 0;
  }
  
  /**
   * Limpa cache de secrets
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🔐 SecretManager: Cache cleared');
  }
  
  /**
   * Gera hash do secret para logging seguro
   */
  getSecretHash(secret: string): string {
    return createHash('sha256')
      .update(secret)
      .digest('hex')
      .substring(0, 8);
  }
  
  /**
   * Valida formato de API key
   */
  validateApiKey(key: string): boolean {
    // Anthropic API keys começam com 'sk-ant-'
    if (key.startsWith('sk-ant-')) {
      return key.length >= 50; // Tamanho mínimo esperado
    }
    
    // Outros formatos de API key
    if (key.startsWith('sk-')) {
      return key.length >= 20;
    }
    
    return false;
  }
  
  /**
   * Obtém informações de diagnóstico (sem expor secrets)
   */
  async getDiagnostics(): Promise<{
    providersAvailable: number;
    secretsConfigured: string[];
    cacheSize: number;
    environment: string;
  }> {
    const availableProviders = [];
    for (const provider of this.providers) {
      if (await provider.isAvailable()) {
        availableProviders.push(provider.constructor.name);
      }
    }
    
    // Lista de secrets comuns para verificar (sem expor valores)
    const commonSecrets = ['ANTHROPIC_API_KEY', 'JWT_SECRET', 'DATABASE_URL'];
    const configuredSecrets = [];
    
    for (const secret of commonSecrets) {
      if (await this.isSecretConfigured(secret)) {
        configuredSecrets.push(secret);
      }
    }
    
    return {
      providersAvailable: availableProviders.length,
      secretsConfigured: configuredSecrets,
      cacheSize: this.cache.size,
      environment: process.env.NODE_ENV || 'development'
    };
  }
}

// Singleton instance
export const secretManager = new SecretManager();
