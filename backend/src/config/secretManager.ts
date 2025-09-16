/**
 * GENESIS LUMINAL - SECRET MANAGER ENTERPRISE
 * Gestão centralizada de segredos com suporte multi-cloud
 * Implementação REAL com Azure/AWS/GCP Secret Manager
 */

import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { logger } from '../utils/logger';

export interface ISecretManager {
  getSecret(secretName: string): Promise<string | null>;
  setSecret(secretName: string, secretValue: string): Promise<boolean>;
  rotateSecret(secretName: string): Promise<boolean>;
  listSecrets(): Promise<string[]>;
  deleteSecret(secretName: string): Promise<boolean>;
}

export interface SecretManagerConfig {
  provider: 'azure' | 'aws' | 'gcp' | 'vault' | 'local';
  vaultUrl?: string;
  region?: string;
  projectId?: string;
  keyVaultName?: string;
}

class AzureSecretManager implements ISecretManager {
  private client: SecretClient;

  constructor(config: SecretManagerConfig) {
    if (!config.keyVaultName) {
      throw new Error('Azure Key Vault name is required');
    }
    
    const credential = new DefaultAzureCredential();
    const vaultUrl = `https://${config.keyVaultName}.vault.azure.net/`;
    this.client = new SecretClient(vaultUrl, credential);
  }

  async getSecret(secretName: string): Promise<string | null> {
    try {
      const secret = await this.client.getSecret(secretName);
      return secret.value || null;
    } catch (error) {
      logger.error(`Failed to get secret from Azure: ${secretName}`, error);
      return null;
    }
  }

  async setSecret(secretName: string, secretValue: string): Promise<boolean> {
    try {
      await this.client.setSecret(secretName, secretValue);
      logger.info(`Secret set successfully in Azure: ${secretName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to set secret in Azure: ${secretName}`, error);
      return false;
    }
  }

  async rotateSecret(secretName: string): Promise<boolean> {
    try {
      // Implementar lógica de rotação específica do Azure
      const currentSecret = await this.getSecret(secretName);
      if (!currentSecret) return false;

      // Gerar nova versão do secret (implementar lógica específica)
      const newSecretValue = await this.generateNewSecretValue(secretName, currentSecret);
      return await this.setSecret(secretName, newSecretValue);
    } catch (error) {
      logger.error(`Failed to rotate secret in Azure: ${secretName}`, error);
      return false;
    }
  }

  async listSecrets(): Promise<string[]> {
    try {
      const secrets: string[] = [];
      for await (const secretProperties of this.client.listPropertiesOfSecrets()) {
        if (secretProperties.name) {
          secrets.push(secretProperties.name);
        }
      }
      return secrets;
    } catch (error) {
      logger.error('Failed to list secrets from Azure', error);
      return [];
    }
  }

  async deleteSecret(secretName: string): Promise<boolean> {
    try {
      await this.client.beginDeleteSecret(secretName);
      logger.info(`Secret deleted successfully from Azure: ${secretName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete secret from Azure: ${secretName}`, error);
      return false;
    }
  }

  private async generateNewSecretValue(secretName: string, currentValue: string): Promise<string> {
    // Implementar lógica de geração de novos secrets baseada no tipo
    // Para API Keys, gerar novo token via API do provedor
    // Para senhas, usar crypto.randomBytes
    const crypto = await import('crypto');
    return crypto.randomBytes(32).toString('base64');
  }
}

class AWSSecretManager implements ISecretManager {
  private client: SecretsManagerClient;

  constructor(config: SecretManagerConfig) {
    this.client = new SecretsManagerClient({
      region: config.region || 'us-east-1'
    });
  }

  async getSecret(secretName: string): Promise<string | null> {
    try {
      const command = new GetSecretValueCommand({ SecretId: secretName });
      const response = await this.client.send(command);
      return response.SecretString || null;
    } catch (error) {
      logger.error(`Failed to get secret from AWS: ${secretName}`, error);
      return null;
    }
  }

  async setSecret(secretName: string, secretValue: string): Promise<boolean> {
    try {
      const { CreateSecretCommand, UpdateSecretCommand } = await import('@aws-sdk/client-secrets-manager');
      
      try {
        // Tentar atualizar primeiro
        const updateCommand = new UpdateSecretCommand({
          SecretId: secretName,
          SecretString: secretValue
        });
        await this.client.send(updateCommand);
      } catch {
        // Se não existir, criar novo
        const createCommand = new CreateSecretCommand({
          Name: secretName,
          SecretString: secretValue
        });
        await this.client.send(createCommand);
      }
      
      logger.info(`Secret set successfully in AWS: ${secretName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to set secret in AWS: ${secretName}`, error);
      return false;
    }
  }

  async rotateSecret(secretName: string): Promise<boolean> {
    try {
      const { RotateSecretCommand } = await import('@aws-sdk/client-secrets-manager');
      const command = new RotateSecretCommand({ SecretId: secretName });
      await this.client.send(command);
      logger.info(`Secret rotated successfully in AWS: ${secretName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to rotate secret in AWS: ${secretName}`, error);
      return false;
    }
  }

  async listSecrets(): Promise<string[]> {
    try {
      const { ListSecretsCommand } = await import('@aws-sdk/client-secrets-manager');
      const command = new ListSecretsCommand({});
      const response = await this.client.send(command);
      return response.SecretList?.map(secret => secret.Name || '') || [];
    } catch (error) {
      logger.error('Failed to list secrets from AWS', error);
      return [];
    }
  }

  async deleteSecret(secretName: string): Promise<boolean> {
    try {
      const { DeleteSecretCommand } = await import('@aws-sdk/client-secrets-manager');
      const command = new DeleteSecretCommand({ 
        SecretId: secretName,
        ForceDeleteWithoutRecovery: true 
      });
      await this.client.send(command);
      logger.info(`Secret deleted successfully from AWS: ${secretName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete secret from AWS: ${secretName}`, error);
      return false;
    }
  }
}

class GCPSecretManager implements ISecretManager {
  private client: SecretManagerServiceClient;
  private projectId: string;

  constructor(config: SecretManagerConfig) {
    if (!config.projectId) {
      throw new Error('GCP Project ID is required');
    }
    
    this.client = new SecretManagerServiceClient();
    this.projectId = config.projectId;
  }

  async getSecret(secretName: string): Promise<string | null> {
    try {
      const [version] = await this.client.accessSecretVersion({
        name: `projects/${this.projectId}/secrets/${secretName}/versions/latest`,
      });
      
      return version.payload?.data?.toString() || null;
    } catch (error) {
      logger.error(`Failed to get secret from GCP: ${secretName}`, error);
      return null;
    }
  }

  async setSecret(secretName: string, secretValue: string): Promise<boolean> {
    try {
      // Criar secret se não existir
      try {
        await this.client.createSecret({
          parent: `projects/${this.projectId}`,
          secretId: secretName,
          secret: { replication: { automatic: {} } }
        });
      } catch {
        // Secret já existe, continuar
      }

      // Adicionar versão do secret
      await this.client.addSecretVersion({
        parent: `projects/${this.projectId}/secrets/${secretName}`,
        payload: { data: Buffer.from(secretValue) }
      });

      logger.info(`Secret set successfully in GCP: ${secretName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to set secret in GCP: ${secretName}`, error);
      return false;
    }
  }

  async rotateSecret(secretName: string): Promise<boolean> {
    try {
      const currentSecret = await this.getSecret(secretName);
      if (!currentSecret) return false;

      // Gerar nova versão
      const crypto = await import('crypto');
      const newSecretValue = crypto.randomBytes(32).toString('base64');
      
      return await this.setSecret(secretName, newSecretValue);
    } catch (error) {
      logger.error(`Failed to rotate secret in GCP: ${secretName}`, error);
      return false;
    }
  }

  async listSecrets(): Promise<string[]> {
    try {
      const [secrets] = await this.client.listSecrets({
        parent: `projects/${this.projectId}`
      });
      
      return secrets.map(secret => {
        const name = secret.name || '';
        return name.split('/').pop() || '';
      }).filter(Boolean);
    } catch (error) {
      logger.error('Failed to list secrets from GCP', error);
      return [];
    }
  }

  async deleteSecret(secretName: string): Promise<boolean> {
    try {
      await this.client.deleteSecret({
        name: `projects/${this.projectId}/secrets/${secretName}`
      });
      logger.info(`Secret deleted successfully from GCP: ${secretName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete secret from GCP: ${secretName}`, error);
      return false;
    }
  }
}

class LocalSecretManager implements ISecretManager {
  private secrets: Map<string, string> = new Map();

  constructor() {
    // Carregar secrets do .env para desenvolvimento
    this.loadFromEnv();
  }

  private loadFromEnv() {
    const env = process.env;
    Object.keys(env).forEach(key => {
      if (key.endsWith('_KEY') || key.endsWith('_SECRET') || key.endsWith('_TOKEN')) {
        this.secrets.set(key, env[key] || '');
      }
    });
  }

  async getSecret(secretName: string): Promise<string | null> {
    return this.secrets.get(secretName) || null;
  }

  async setSecret(secretName: string, secretValue: string): Promise<boolean> {
    this.secrets.set(secretName, secretValue);
    logger.warn(`Secret stored locally (development only): ${secretName}`);
    return true;
  }

  async rotateSecret(secretName: string): Promise<boolean> {
    logger.warn(`Secret rotation not implemented for local development: ${secretName}`);
    return false;
  }

  async listSecrets(): Promise<string[]> {
    return Array.from(this.secrets.keys());
  }

  async deleteSecret(secretName: string): Promise<boolean> {
    return this.secrets.delete(secretName);
  }
}

export class SecretManagerFactory {
  static create(config: SecretManagerConfig): ISecretManager {
    switch (config.provider) {
      case 'azure':
        return new AzureSecretManager(config);
      case 'aws':
        return new AWSSecretManager(config);
      case 'gcp':
        return new GCPSecretManager(config);
      case 'local':
        return new LocalSecretManager();
      default:
        throw new Error(`Unsupported secret manager provider: ${config.provider}`);
    }
  }
}

// Singleton instance
let secretManagerInstance: ISecretManager | null = null;

export function getSecretManager(): ISecretManager {
  if (!secretManagerInstance) {
    const config: SecretManagerConfig = {
      provider: (process.env.SECRET_MANAGER_PROVIDER as any) || 'local',
      keyVaultName: process.env.AZURE_KEY_VAULT_NAME,
      region: process.env.AWS_REGION,
      projectId: process.env.GCP_PROJECT_ID
    };

    secretManagerInstance = SecretManagerFactory.create(config);
    logger.info(`Secret Manager initialized with provider: ${config.provider}`);
  }

  return secretManagerInstance;
}

export default SecretManagerFactory;
