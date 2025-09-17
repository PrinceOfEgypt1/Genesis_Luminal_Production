/**
 * GENESIS LUMINAL - SECRET MANAGER ENTERPRISE
 * Versão Inicial Simplificada para Local Development
 */

interface ISecretManager {
  getSecret(secretName: string): Promise<string | null>;
  setSecret(secretName: string, secretValue: string): Promise<boolean>;
  listSecrets(): Promise<string[]>;
}

interface SecretManagerConfig {
  provider: 'local' | 'azure' | 'aws' | 'gcp';
}

class LocalSecretManager implements ISecretManager {
  private secrets: Map<string, string> = new Map();

  constructor() {
    console.log('🔐 Initializing Local Secret Manager');
    this.loadFromEnv();
  }

  private loadFromEnv() {
    const env = process.env;
    let secretCount = 0;
    
    Object.keys(env).forEach(key => {
      if (key.endsWith('_KEY') || key.endsWith('_SECRET') || key.endsWith('_TOKEN') || key.includes('API')) {
        this.secrets.set(key, env[key] || '');
        secretCount++;
      }
    });
    
    console.log(`📊 Loaded ${secretCount} secrets from environment`);
  }

  async getSecret(secretName: string): Promise<string | null> {
    const secret = this.secrets.get(secretName);
    if (secret) {
      console.log(`🔑 Retrieved secret: ${secretName}`);
    } else {
      console.warn(`⚠️ Secret not found: ${secretName}`);
    }
    return secret || null;
  }

  async setSecret(secretName: string, secretValue: string): Promise<boolean> {
    this.secrets.set(secretName, secretValue);
    console.log(`✅ Secret stored: ${secretName}`);
    return true;
  }

  async listSecrets(): Promise<string[]> {
    const secretNames = Array.from(this.secrets.keys());
    console.log(`📋 Available secrets: ${secretNames.length}`);
    return secretNames;
  }
}

export class SecretManagerFactory {
  static create(config: SecretManagerConfig): ISecretManager {
    switch (config.provider) {
      case 'local':
        return new LocalSecretManager();
      default:
        console.warn(`Provider ${config.provider} not implemented, using local fallback`);
        return new LocalSecretManager();
    }
  }
}

// Singleton para evitar múltiplas instâncias
let secretManagerInstance: ISecretManager | null = null;

export function getSecretManager(): ISecretManager {
  if (!secretManagerInstance) {
    const config: SecretManagerConfig = {
      provider: 'local' // Por enquanto sempre local
    };

    secretManagerInstance = SecretManagerFactory.create(config);
    console.log('🚀 Secret Manager initialized successfully');
  }

  return secretManagerInstance;
}

export { ISecretManager, SecretManagerConfig };
export default SecretManagerFactory;
