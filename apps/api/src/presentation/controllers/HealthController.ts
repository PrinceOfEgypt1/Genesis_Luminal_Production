/**
 * Health Controller - Presentation Layer
 * IMPLEMENTADO: Controller seguindo Clean Architecture
 */

import { Request, Response } from 'express';
import { HealthCheckUseCase } from '../../application/usecases/HealthCheckUseCase';
import { createApiError, ErrorCodes } from '../../infrastructure/middleware/validation/error-handler';

export class HealthController {
  constructor(
    private readonly healthCheckUseCase: HealthCheckUseCase
  ) {}

  async checkLiveness(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.healthCheckUseCase.checkLiveness();
      res.json(result.toJSON());
    } catch (error) {
      throw createApiError(
        500,
        ErrorCodes.INTERNAL_ERROR,
        'Falha na verificação de vida do serviço'
      );
    }
  }

  async checkReadiness(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.healthCheckUseCase.checkReadiness();
      const statusCode = result.isHealthy() ? 200 : 503;
      res.status(statusCode).json(result.toJSON());
    } catch (error) {
      throw createApiError(
        503,
        ErrorCodes.SERVICE_UNAVAILABLE,
        'Falha na verificação de prontidão do serviço'
      );
    }
  }

  async getSystemStatus(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.healthCheckUseCase.getDetailedStatus();
      res.json(result.toJSON());
    } catch (error) {
      throw createApiError(
        500,
        ErrorCodes.INTERNAL_ERROR,
        'Falha ao obter status do sistema'
      );
    }
  }
}
