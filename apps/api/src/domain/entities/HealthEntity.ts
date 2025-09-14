/**
 * Entidade de domínio para health checks
 */

export class HealthEntity {
  constructor(
    public readonly timestamp: Date,
    public readonly status: HealthStatus,
    public readonly services: ServiceHealth[]
  ) {}

  static create(services: ServiceHealth[]): HealthEntity {
    const overallStatus = services.every(s => s.status === 'healthy') 
      ? HealthStatus.HEALTHY 
      : services.some(s => s.status === 'degraded')
      ? HealthStatus.DEGRADED
      : HealthStatus.UNHEALTHY;

    return new HealthEntity(new Date(), overallStatus, services);
  }

  isHealthy(): boolean {
    return this.status === HealthStatus.HEALTHY;
  }

  getUnhealthyServices(): ServiceHealth[] {
    return this.services.filter(s => s.status !== 'healthy');
  }

  toResponse() {
    return {
      status: this.status,
      timestamp: this.timestamp.toISOString(),
      services: this.services.map(s => ({
        name: s.name,
        status: s.status,
        responseTime: s.responseTime,
        lastCheck: s.lastCheck?.toISOString()
      }))
    };
  }
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy'
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastCheck?: Date;
  error?: string;
}
