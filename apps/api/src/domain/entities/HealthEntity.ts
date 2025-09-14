/**
 * Health Domain Entity - Clean Architecture
 * ATUALIZADO: Entidade de domínio completa para health checks
 */

export enum HealthStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown'
}

export enum SystemStatus {
  OPERATIONAL = 'operational',
  DEGRADED = 'degraded',
  DOWN = 'down'
}

export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  lastCheck: Date;
  responseTime?: number;
  details?: Record<string, any>;
}

export class HealthEntity {
  constructor(
    public readonly timestamp: Date,
    public readonly status: HealthStatus,
    public readonly services: ServiceHealth[]
  ) {}

  static create(services: ServiceHealth[]): HealthEntity {
    const overallStatus = services.every(s => s.status === HealthStatus.HEALTHY) 
      ? HealthStatus.HEALTHY 
      : services.some(s => s.status === HealthStatus.UNHEALTHY)
      ? HealthStatus.UNHEALTHY
      : HealthStatus.UNKNOWN;
    
    return new HealthEntity(
      new Date(),
      overallStatus,
      services
    );
  }

  public isHealthy(): boolean {
    return this.status === HealthStatus.HEALTHY;
  }

  public getUnhealthyServices(): ServiceHealth[] {
    return this.services.filter(s => s.status !== HealthStatus.HEALTHY);
  }

  public getSystemStatus(): SystemStatus {
    if (this.status === HealthStatus.HEALTHY) {
      return SystemStatus.OPERATIONAL;
    }
    
    const unhealthyCount = this.getUnhealthyServices().length;
    const totalCount = this.services.length;
    
    // Se mais de 50% dos serviços estão falhando, sistema está DOWN
    if (unhealthyCount / totalCount > 0.5) {
      return SystemStatus.DOWN;
    }
    
    return SystemStatus.DEGRADED;
  }

  public toJSON() {
    return {
      timestamp: this.timestamp.toISOString(),
      status: this.status,
      systemStatus: this.getSystemStatus(),
      isHealthy: this.isHealthy(),
      services: this.services.map(s => ({
        ...s,
        lastCheck: s.lastCheck.toISOString()
      })),
      summary: {
        total: this.services.length,
        healthy: this.services.filter(s => s.status === HealthStatus.HEALTHY).length,
        unhealthy: this.getUnhealthyServices().length
      }
    };
  }
}
