/**
 * Métricas Prometheus - Sprint 5 Passo 2
 */
import { register, Counter, Histogram } from 'prom-client';

export class PrometheusMetrics {
  private requestsTotal = new Counter({
    name: 'genesis_requests_total',
    help: 'Total requests',
    labelNames: ['method', 'status'],
  });

  private requestDuration = new Histogram({
    name: 'genesis_request_duration_seconds',
    help: 'Request duration',
    labelNames: ['method'],
  });

  constructor() {
    register.registerMetric(this.requestsTotal);
    register.registerMetric(this.requestDuration);
  }

  public recordRequest(method: string, status: number, duration: number): void {
    this.requestsTotal.labels(method, status.toString()).inc();
    this.requestDuration.labels(method).observe(duration);
  }

  public async getMetrics(): Promise<string> {
    return register.metrics();
  }
}

export const prometheusMetrics = new PrometheusMetrics();
