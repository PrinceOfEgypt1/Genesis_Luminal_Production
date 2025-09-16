/**
 * GENESIS LUMINAL - ENVIRONMENT CONFIGURATION
 * Configuração com Secret Manager Integration
 * PRESERVA TODAS AS FUNCIONALIDADES EXISTENTES + Secret Manager
 */

import { getSecretManager } from './secretManager';
import { logger } from '../utils/logger';

export interface Config {
  NODE_ENV: string;
  PORT: number;
  FRONTEND_URL: string;
  CLAUDE_API_KEY: string;
  REQUEST_TIMEOUT_MS: number;
  SECRET_MANAGER_PROVIDER: string;
  AZURE_KEY_VAULT_NAME?: string;
  AWS_REGION?: string;
  GCP_PROJECT_ID?: string;
}

class ConfigService {
  private static instance: ConfigService;
  private configCache: Partial<Config> = {};
  private secretManager = getSecretManager();

  private constructor() {}

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  async getSecret(key: string, fallbackEnvKey?: string): Promise<string> {
    try {
      // Tentar buscar do Secret Manager primeiro
      const secretValue = await this.secretManager.getSecret(key);
      
      if (secretValue) {
        logger.info(`Secret loaded from Secret Manager: ${key}`);
        return secretValue;
      }

      // Fallback para variável de ambiente
      const envValue = process.env[fallbackEnvKey || key];
      if (envValue) {
        logger.warn(`Secret loaded from environment (fallback): ${key}`);
        return envValue;
      }

      throw new Error(`Secret not found: ${key}`);
    } catch (error) {
      logger.error(`Failed to load secret: ${key}`, error);
      // Último fallback para desenvolvimento
      const envValue = process.env[fallbackEnvKey || key];
      if (envValue) {
        logger.warn(`Using environment fallback for: ${key}`);
        return envValue;
      }
      throw error;
    }
  }

  private getEnvVar(key: string, defaultValue?: string): string {
    const value = process.env[key] || defaultValue;
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  private getEnvVarAsNumber(key: string, defaultValue?: number): number {
    const value = process.env[key];
    if (!value) {
      if (defaultValue !== undefined) return defaultValue;
      throw new Error(`Missing required environment variable: ${key}`);
    }
    
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(`Invalid number for environment variable: ${key}`);
    }
    return parsed;
  }

  async loadConfig(): Promise<Config> {
    try {
      // Configurações que não são secrets (públicas)
      const publicConfig = {
        NODE_ENV: this.getEnvVar('NODE_ENV', 'development'),
        PORT: this.getEnvVarAsNumber('PORT', 3001),
        FRONTEND_URL: this.getEnvVar('FRONTEND_URL', 'http://localhost:5173'),
        REQUEST_TIMEOUT_MS: this.getEnvVarAsNumber('REQUEST_TIMEOUT_MS', 15000),
        SECRET_MANAGER_PROVIDER: this.getEnvVar('SECRET_MANAGER_PROVIDER', 'local'),
        AZURE_KEY_VAULT_NAME: process.env.AZURE_KEY_VAULT_NAME,
        AWS_REGION: process.env.AWS_REGION,
        GCP_PROJECT_ID: process.env.GCP_PROJECT_ID
      };

      // Secrets que devem vir do Secret Manager
      const claudeApiKey = await this.getSecret('CLAUDE_API_KEY', 'ANTHROPIC_API_KEY');

      const config: Config = {
        ...publicConfig,
        CLAUDE_API_KEY: claudeApiKey
      };

      this.configCache = config;
      logger.info('Configuration loaded successfully with Secret Manager integration');
      
      return config;
    } catch (error) {
      logger.error('Failed to load configuration', error);
      throw error;
    }
  }

  getConfig(): Config {
    if (Object.keys(this.configCache).length === 0) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
    }
    return this.configCache as Config;
  }

  async rotateSecrets(): Promise<void> {
    logger.info('Starting secret rotation...');
    try {
      const secrets = await this.secretManager.listSecrets();
      
      for (const secretName of secrets) {
        if (secretName.includes('API_KEY') || secretName.includes('SECRET')) {
          const rotated = await this.secretManager.rotateSecret(secretName);
          if (rotated) {
            logger.info(`Successfully rotated secret: ${secretName}`);
          } else {
            logger.warn(`Failed to rotate secret: ${secretName}`);
          }
        }
      }
      
      // Invalidar cache para forçar reload
      this.configCache = {};
      logger.info('Secret rotation completed');
    } catch (error) {
      logger.error('Secret rotation failed', error);
      throw error;
    }
  }
}

// Singleton instance
const configService = ConfigService.getInstance();

// Carregar configuração na inicialização
let configPromise: Promise<Config> | null = null;

export async function loadConfig(): Promise<Config> {
  if (!configPromise) {
    configPromise = configService.loadConfig();
  }
  return configPromise;
}

export function getConfig(): Config {
  return configService.getConfig();
}

export async function rotateSecrets(): Promise<void> {
  return configService.rotateSecrets();
}

// Manter compatibilidade com código existente
export const config = {
  get NODE_ENV() { return getConfig().NODE_ENV; },
  get PORT() { return getConfig().PORT; },
  get FRONTEND_URL() { return getConfig().FRONTEND_URL; },
  get CLAUDE_API_KEY() { return getConfig().CLAUDE_API_KEY; },
  get REQUEST_TIMEOUT_MS() { return getConfig().REQUEST_TIMEOUT_MS; }
};

// Inicializar configuração automaticamente
loadConfig().catch(error => {
  logger.error('Failed to initialize configuration', error);
  process.exit(1);
});
