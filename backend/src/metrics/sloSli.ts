/**
 * @fileoverview Métricas básicas para Genesis Luminal
 * @version 1.0.0
 */

import { register, Histogram, Counter } from 'prom-client';

export class GenesisLuminalSLI {
  public readonly requestDuration = new Histogram({
    name: 'genesis_luminal_request_duration_seconds',
    help: 'Request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0],
  });

  public readonly requestsTotal = new Counter({
    name: 'genesis_luminal_requests_total',
    help: 'Total number of requests',
    labelNames: ['method', 'route', 'status_code'],
  });

  constructor() {
    register.registerMetric(this.requestDuration);
    register.registerMetric(this.requestsTotal);
  }

  public recordRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number
  ): void {
    this.requestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);
    
    this.requestsTotal
      .labels(method, route, statusCode.toString())
      .inc();
  }
}

export const sliMetrics = new GenesisLuminalSLI();
