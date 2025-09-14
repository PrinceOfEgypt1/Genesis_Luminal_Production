/**
 * Health Service Interface - Application Layer
 * IMPLEMENTADO: Interface para serviços de health check
 */

import { HealthEntity, ServiceHealth } from '../../domain/entities/HealthEntity';

export interface IHealthService {
  checkLiveness(): Promise<HealthEntity>;
  checkReadiness(): Promise<HealthEntity>;
  getDetailedStatus(): Promise<HealthEntity>;
  checkDependencies(): Promise<ServiceHealth[]>;
}
