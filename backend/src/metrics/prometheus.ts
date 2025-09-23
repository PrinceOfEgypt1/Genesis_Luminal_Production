import { register, Counter, Histogram } from 'prom-client';

export class PrometheusMetrics {
  private requestsTotal = new Counter({
    name: 'genesis_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'status'],
  });

  private requestDuration = new Histogram({
    name: 'genesis_request_duration_seconds',
    help: 'HTTP request duration',
    labelNames: ['method'],
    buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0, 5.0],
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
