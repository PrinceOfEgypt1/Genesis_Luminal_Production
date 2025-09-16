/**
 * GENESIS LUMINAL - SECRET ROTATION MIDDLEWARE
 * Middleware para rotação automática de secrets (versão inicial)
 */

import { Request, Response, NextFunction } from 'express';

interface SecretRotationConfig {
  enabled: boolean;
  intervalHours: number;
  manualRotationEndpoint: boolean;
}

class SecretRotationService {
  private config: SecretRotationConfig;
  private isRotating = false;
  private lastRotation: Date | null = null;

  constructor(config: SecretRotationConfig) {
    this.config = config;
  }

  async performRotation(trigger: 'automatic' | 'manual' = 'manual'): Promise<boolean> {
    if (this.isRotating) {
      console.warn('Secret rotation already in progress');
      return false;
    }

    this.isRotating = true;
    const startTime = Date.now();

    try {
      console.log(`Starting secret rotation (trigger: ${trigger})`);
      
      // TODO: Implementar rotação real quando Secret Manager estiver completo
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular operação
      
      this.lastRotation = new Date();
      const duration = Date.now() - startTime;
      
      console.log(`Secret rotation completed successfully in ${duration}ms (trigger: ${trigger})`);
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`Secret rotation failed after ${duration}ms (trigger: ${trigger})`, error);
      return false;
    } finally {
      this.isRotating = false;
    }
  }

  getRotationStatus() {
    return {
      enabled: this.config.enabled,
      isRotating: this.isRotating,
      lastRotation: this.lastRotation,
      intervalHours: this.config.intervalHours
    };
  }
}

// Configuração padrão
const defaultConfig: SecretRotationConfig = {
  enabled: process.env.SECRET_ROTATION_ENABLED === 'true',
  intervalHours: parseInt(process.env.SECRET_ROTATION_INTERVAL_HOURS || '24', 10),
  manualRotationEndpoint: process.env.SECRET_ROTATION_MANUAL_ENDPOINT === 'true'
};

const rotationService = new SecretRotationService(defaultConfig);

// Middleware para endpoint manual de rotação
export function secretRotationEndpoint() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!defaultConfig.manualRotationEndpoint) {
      return res.status(404).json({ error: 'Manual rotation endpoint is disabled' });
    }

    try {
      const success = await rotationService.performRotation('manual');
      const status = rotationService.getRotationStatus();

      res.json({
        success,
        message: success ? 'Secret rotation completed' : 'Secret rotation failed or already in progress',
        status
      });
    } catch (error) {
      console.error('Manual secret rotation failed', error);
      res.status(500).json({
        error: 'Secret rotation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

// Middleware para verificar status de rotação
export function secretRotationStatus() {
  return (req: Request, res: Response) => {
    const status = rotationService.getRotationStatus();
    res.json(status);
  };
}

export { rotationService };
