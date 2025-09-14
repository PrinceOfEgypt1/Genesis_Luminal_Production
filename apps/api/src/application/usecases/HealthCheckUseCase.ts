/**
 * Health Check Use Case - Application Layer
 * ATUALIZADO: Use case completo seguindo Clean Architecture
 */

import { HealthEntity, ServiceHealth, HealthStatus } from '../../domain/entities/HealthEntity';
import { IHealthService } from '../interfaces/IHealthService';
import { ProcessingMetrics } from '../../domain/value-objects/ProcessingMetrics';

export class HealthCheckUseCase implements IHealthService {
  constructor(
    private readonly logger?: any,
    private readonly cache?: any,
    private readonly analyzer?: any
  ) {}

  async checkLiveness(): Promise<HealthEntity> {
    const startTime = new Date();
    
    try {
      // Verificação básica de vida - sempre deve passar
      const services: ServiceHealth[] = [
        {
          name: 'application',
          status: HealthStatus.HEALTHY,
          lastCheck: new Date(),
          responseTime: 1
        }
      ];

      const entity = HealthEntity.create(services);
      
      this.logger?.info('Liveness check completed', {
        status: entity.status,
        duration: Date.now() - startTime.getTime()
      });

      return entity;
    } catch (error) {
      this.logger?.error('Liveness check failed', { error });
      throw error;
    }
  }

  async checkReadiness(): Promise<HealthEntity> {
    const startTime = new Date();
    
    try {
      const dependencies = await this.checkDependencies();
      const entity = HealthEntity.create(dependencies);
      
      this.logger?.info('Readiness check completed', {
        status: entity.status,
        systemStatus: entity.getSystemStatus(),
        unhealthyServices: entity.getUnhealthyServices().length,
        duration: Date.now() - startTime.getTime()
      });

      return entity;
    } catch (error) {
      this.logger?.error('Readiness check failed', { error });
      throw error;
    }
  }

  async getDetailedStatus(): Promise<HealthEntity> {
    const startTime = new Date();
    
    try {
      const dependencies = await this.checkDependencies();
      const entity = HealthEntity.create(dependencies);
      
      // Adicionar métricas de sistema
      const metrics = ProcessingMetrics.create(startTime, 0);
      
      this.logger?.info('Detailed status check completed', {
        status: entity.status,
        systemStatus: entity.getSystemStatus(),
        metrics: metrics.toJSON(),
        services: entity.services.length
      });

      return entity;
    } catch (error) {
      this.logger?.error('Detailed status check failed', { error });
      throw error;
    }
  }

  async checkDependencies(): Promise<ServiceHealth[]> {
    const dependencies: ServiceHealth[] = [];
    const checkStart = new Date();

    // Verificar cache (se disponível)
    try {
      if (this.cache) {
        await this.cache.ping?.();
        dependencies.push({
          name: 'cache',
          status: HealthStatus.HEALTHY,
          lastCheck: new Date(),
          responseTime: Date.now() - checkStart.getTime()
        });
      } else {
        dependencies.push({
          name: 'cache',
          status: HealthStatus.UNKNOWN,
          lastCheck: new Date(),
          details: { reason: 'Not configured' }
        });
      }
    } catch (error) {
      dependencies.push({
        name: 'cache',
        status: HealthStatus.UNHEALTHY,
        lastCheck: new Date(),
        details: { error: error.message }
      });
    }

    // Verificar analyzer (se disponível)
    try {
      if (this.analyzer) {
        dependencies.push({
          name: 'emotional_analyzer',
          status: HealthStatus.HEALTHY,
          lastCheck: new Date(),
          responseTime: Date.now() - checkStart.getTime()
        });
      } else {
        dependencies.push({
          name: 'emotional_analyzer',
          status: HealthStatus.UNKNOWN,
          lastCheck: new Date(),
          details: { reason: 'Not configured' }
        });
      }
    } catch (error) {
      dependencies.push({
        name: 'emotional_analyzer',
        status: HealthStatus.UNHEALTHY,
        lastCheck: new Date(),
        details: { error: error.message }
      });
    }

    // Verificar database (simulado)
    dependencies.push({
      name: 'database',
      status: HealthStatus.HEALTHY,
      lastCheck: new Date(),
      responseTime: 15,
      details: { connection: 'simulated' }
    });

    return dependencies;
  }
}
