/**
 * @fileoverview Enterprise Secret Management
 * @version 1.0.0
 */

interface SecretConfig {
  name: string;
  required: boolean;
  defaultValue?: string;
}

interface SecretStore {
  [key: string]: string;
}

export class SecretManager {
  private static instance: SecretManager;
  private secrets: SecretStore = {};
  private initialized = false;

  private constructor() {}

  public static getInstance(): SecretManager {
    if (!SecretManager.instance) {
      SecretManager.instance = new SecretManager();
    }
    return SecretManager.instance;
  }

  /**
   * Initialize secret manager
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    // For now, use environment variables with validation
    // TODO: Replace with AWS Secrets Manager / Azure Key Vault
    this.loadFromEnvironment();
    this.validateSecrets();
    
    this.initialized = true;
    console.log('🔐 SecretManager initialized');
  }

  /**
   * Get secret value
   */
  public getSecret(key: string): string {
    if (!this.initialized) {
      throw new Error('SecretManager not initialized');
    }
    
    const value = this.secrets[key];
    if (!value) {
      throw new Error(`Secret '${key}' not found`);
    }
    
    return value;
  }

  /**
   * Check if secret exists
   */
  public hasSecret(key: string): boolean {
    return !!this.secrets[key];
  }

  /**
   * Load secrets from environment (temporary solution)
   */
  private loadFromEnvironment(): void {
    const secretConfigs: SecretConfig[] = [
      { name: 'ANTHROPIC_API_KEY', required: false, defaultValue: 'SIMULATION_MODE' },
      { name: 'JWT_SECRET', required: true },
      { name: 'DB_PASSWORD', required: false },
      { name: 'ENCRYPTION_KEY', required: true }
    ];

    secretConfigs.forEach(config => {
      const value = process.env[config.name] || config.defaultValue;
      
      if (!value && config.required) {
        console.warn(`⚠️ Required secret '${config.name}' not found`);
        // Generate temporary secret for development
        this.secrets[config.name] = this.generateTemporarySecret();
      } else if (value) {
        this.secrets[config.name] = value;
      }
    });

    // Remove sensitive environment variables from process.env
    this.cleanEnvironment();
  }

  /**
   * Validate loaded secrets
   */
  private validateSecrets(): void {
    const requiredSecrets = ['JWT_SECRET', 'ENCRYPTION_KEY'];
    
    requiredSecrets.forEach(secret => {
      if (!this.secrets[secret]) {
        throw new Error(`Critical secret '${secret}' is missing`);
      }
    });
  }

  /**
   * Generate temporary secret for development
   */
  private generateTemporarySecret(): string {
    return `temp_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
  }

  /**
   * Clean sensitive data from environment
   */
  private cleanEnvironment(): void {
    const sensitiveKeys = [
      'ANTHROPIC_API_KEY',
      'JWT_SECRET', 
      'DB_PASSWORD',
      'ENCRYPTION_KEY'
    ];

    sensitiveKeys.forEach(key => {
      if (process.env[key]) {
        delete process.env[key];
      }
    });
  }

  /**
   * Get secret statistics for monitoring
   */
  public getStats(): { total: number; loaded: number; missing: number } {
    const total = Object.keys(this.secrets).length;
    const loaded = Object.values(this.secrets).filter(v => v && !v.startsWith('temp_')).length;
    const missing = total - loaded;

    return { total, loaded, missing };
  }
}

export default SecretManager;
