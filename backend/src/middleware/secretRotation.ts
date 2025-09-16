/**
 * GENESIS LUMINAL - SECRET ROTATION MIDDLEWARE
 * Middleware para rotação automática de secrets
 */

import { Request, Response, NextFunction } from 'express';
import { rotateSecrets } from '../config/environment';
import { logger } from '../utils/logger';
import cron from 'node-cron';

interface SecretRotationConfig {
  enabled: boolean;
  intervalHours: number;
  manualRotationEndpoint: boolean;
  rotationSchedule: string; // Cron schedule
}

class SecretRotationService {
  private config: SecretRotationConfig;
  private isRotating = false;
  private lastRotation: Date | null = null;

  constructor(config: SecretRotationConfig) {
    this.config = config;
    this.setupAutomaticRotation();
  }

  private setupAutomaticRotation() {
    if (!this.config.enabled) {
      logger.info('Secret rotation is disabled');
      return;
    }

    // Configurar rotação automática usando cron
    cron.schedule(this.config.rotationSchedule, async () => {
      await this.performRotation('automatic');
    });

    logger.info(`Secret rotation scheduled: ${this.config.rotationSchedule}`);
  }

  async performRotation(trigger: 'automatic' | 'manual' = 'manual'): Promise<boolean> {
    if (this.isRotating) {
      logger.warn('Secret rotation already in progress');
      return false;
    }

    this.isRotating = true;
    const startTime = Date.now();

    try {
      logger.info(`Starting secret rotation (trigger: ${trigger})`);
      
      // Verificar se é hora de rotacionar
      if (trigger === 'automatic' && this.lastRotation) {
        const hoursSinceLastRotation = (Date.now() - this.lastRotation.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastRotation < this.config.intervalHours) {
          logger.info(`Skipping rotation - only ${hoursSinceLastRotation.toFixed(1)} hours since last rotation`);
          return false;
        }
      }

      await rotateSecrets();
      
      this.lastRotation = new Date();
      const duration = Date.now() - startTime;
      
      logger.info(`Secret rotation completed successfully in ${duration}ms (trigger: ${trigger})`);
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Secret rotation failed after ${duration}ms (trigger: ${trigger})`, error);
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
      schedule: this.config.rotationSchedule,
      intervalHours: this.config.intervalHours
    };
  }
}

// Configuração padrão
const defaultConfig: SecretRotationConfig = {
  enabled: process.env.SECRET_ROTATION_ENABLED === 'true',
  intervalHours: parseInt(process.env.SECRET_ROTATION_INTERVAL_HOURS || '24', 10),
  manualRotationEndpoint: process.env.SECRET_ROTATION_MANUAL_ENDPOINT === 'true',
  rotationSchedule: process.env.SECRET_ROTATION_SCHEDULE || '0 2 * * *' // Daily at 2 AM
};

const rotationService = new SecretRotationService(defaultConfig);

// Middleware para endpoint manual de rotação
export function secretRotationEndpoint() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!defaultConfig.manualRotationEndpoint) {
      return res.status(404).json({ error: 'Manual rotation endpoint is disabled' });
    }

    // Verificar autenticação/autorização aqui se necessário
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
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
      logger.error('Manual secret rotation failed', error);
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

// Middleware para verificar saúde do sistema de rotação
export function secretRotationHealth() {
  return (req: Request, res: Response) => {
    const status = rotationService.getRotationStatus();
    const now = Date.now();
    const isHealthy = status.enabled ? (
      !status.isRotating && (
        !status.lastRotation || 
        (now - status.lastRotation.getTime()) < (status.intervalHours * 2 * 60 * 60 * 1000)
      )
    ) : true;

    res.status(isHealthy ? 200 : 503).json({
      healthy: isHealthy,
      status,
      timestamp: new Date().toISOString()
    });
  };
}

export { rotationService };
