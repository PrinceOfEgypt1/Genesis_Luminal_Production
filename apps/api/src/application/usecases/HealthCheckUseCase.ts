/**
 * Use Case para health checks do sistema
 */

import { IHealthProvider, IEmotionalAnalyzer, ICacheService, ILogger } from '../../domain/interfaces/IEmotionalAnalyzer';
import { HealthEntity, ServiceHealth, HealthStatus } from '../../domain/entities/HealthEntity';

export class HealthCheckUseCase {
  constructor(
    private readonly analyzer: IEmotionalAnalyzer,
    private readonly cache: ICacheService,
    private readonly logger: ILogger
  ) {}

  async checkLiveness(): Promise<{ status: string; timestamp: string }> {
    // Liveness check simples - apenas verifica se o processo está rodando
    return {
      status: 'alive',
      timestamp: new Date().toISOString()
    };
  }

  async checkReadiness(): Promise<{ status: string; ready: boolean; timestamp: string }> {
    try {
      const services = await this.checkAllServices();
      const healthEntity = HealthEntity.create(services);
      
      return {
        status: healthEntity.isHealthy() ? 'ready' : 'not_ready',
        ready: healthEntity.isHealthy(),
        timestamp: healthEntity.timestamp.toISOString()
      };
    } catch (error) {
      this.logger.error('Readiness check failed', { error });
      
      return {
        status: 'not_ready',
        ready: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getDetailedStatus() {
    try {
      const services = await this.checkAllServices();
      const healthEntity = HealthEntity.create(services);
      
      const memoryUsage = process.memoryUsage();
      
      return {
        ...healthEntity.toResponse(),
        service: 'Genesis Luminal API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime_seconds: Math.floor(process.uptime()),
        memory_mb: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024)
        }
      };
    } catch (error) {
      this.logger.error('Detailed status check failed', { error });
      
      return {
        status: HealthStatus.UNHEALTHY,
        timestamp: new Date().toISOString(),
        error: 'Failed to get system status'
      };
    }
  }

  private async checkAllServices(): Promise<ServiceHealth[]> {
    const services: ServiceHealth[] = [];

    // Check Emotional Analyzer
    try {
      const start = Date.now();
      const status = this.analyzer.getStatus();
      const responseTime = Date.now() - start;
      
      services.push({
        name: 'emotional_analyzer',
        status: status.ok ? 'healthy' : 'degraded',
        responseTime,
        lastCheck: new Date()
      });
    } catch (error) {
      services.push({
        name: 'emotional_analyzer',
        status: 'unhealthy',
        lastCheck: new Date(),
        error: String(error)
      });
    }

    // Check Cache Service
    try {
      const start = Date.now();
      await this.cache.set('health_check', 'test', 10);
      const result = await this.cache.get('health_check');
      const responseTime = Date.now() - start;
      
      services.push({
        name: 'cache_service',
        status: result === 'test' ? 'healthy' : 'degraded',
        responseTime,
        lastCheck: new Date()
      });
    } catch (error) {
      services.push({
        name: 'cache_service',
        status: 'degraded', // Cache is optional, so degraded not unhealthy
        lastCheck: new Date(),
        error: String(error)
      });
    }

    return services;
  }
}
